---
title: 'ScyllaDB Data Connector Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Operating guide for the ScyllaDB data connector in production: authentication, TLS, connections and timeouts, datacenter routing, observability, and known limitations.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - data-connectors
  - scylladb
  - observability
---

Production operating guide for the [ScyllaDB data connector](./index.md) covering authentication, TLS, connections and timeouts, datacenter routing, observability, and known limitations. For the full parameter list, see [`params`](./index.md#params).

The connector uses the [ScyllaDB Rust driver](https://docs.rs/scylla/1.6.0/scylla/). Spice sets the contact points, keyspace, connection timeout, credentials, and preferred datacenter; every other driver setting keeps the driver's default.

## Authentication and Secrets

The connector supports username and password authentication. Credentials are sent only when `scylladb_user` is set. If `scylladb_user` is set without `scylladb_pass`, the connector authenticates with an empty password, and `scylladb_pass` without `scylladb_user` is ignored.

`scylladb_pass` is a secret parameter. Resolve it from a [secret store](../../secret-stores/) with `${secrets:...}`:

```yaml
datasets:
  - from: scylladb:orders
    name: orders
    params:
      scylladb_hosts: node1.example.internal,node2.example.internal,node3.example.internal
      scylladb_keyspace: ecommerce
      scylladb_user: spice_reader
      scylladb_pass: ${secrets:scylladb_pass}
```

When the driver's connection error mentions authentication, the dataset fails with an error that ends in `Authentication failed. Ensure that the username and password are correctly configured in the spicepod.` The runtime does not retry this error.

## TLS

The connector does not support TLS. `scylladb_ssl` is accepted but has no effect, and connections to the cluster are not encrypted. Run Spice on the same private network as the cluster, or protect the traffic at the network layer.

## Connections and Timeouts

### Contact Points and Startup Check

`scylladb_hosts` takes precedence over `scylladb_host` when both are set. Either accepts a comma-separated list of hostnames, and `scylladb_port` (default `9042`) applies to every host in the list.

Before it creates a session, the connector resolves each host and opens a TCP connection to it on the configured port, stopping at the first host that answers. Each resolved IP address is tried in turn with a fixed 30-second timeout, so a host that does not respond can delay startup by up to 30 seconds per address. `connection_timeout` does not apply to this check. If none answers, the dataset reports `Cannot connect to the dataset <name> (scylladb) on <hosts>:<port>`, and the runtime treats the failure as transient and retries the dataset load until a host is reachable. List more than one host so that startup succeeds when one of them is down.

### Session and Connection Pool

Each dataset creates its own driver session. The session keeps one connection per shard on each node, which is the driver's [default pool size](https://docs.rs/scylla/1.6.0/scylla/client/enum.PoolSize.html). The connector exposes no parameters for the pool size.

### Timeouts and Consistency

| Setting            | Value                             | Source                                                                         |
| ------------------ | --------------------------------- | ------------------------------------------------------------------------------ |
| Connection timeout | `10000` ms                        | `connection_timeout` parameter (milliseconds). Applies to the driver's connections, not the startup check. |
| Request timeout    | 30 seconds                        | Driver default. Not configurable through Spice.                                |
| Consistency level  | `LOCAL_QUORUM`                    | Driver default. Not configurable through Spice.                                |

`connection_timeout` is written without the `scylladb_` prefix. A value that is not a whole number of milliseconds fails the dataset. See [Adjust Connection Timeout](./performance.md#adjust-connection-timeout) for when to raise it, and the driver's [execution profile documentation](https://docs.rs/scylla/1.6.0/scylla/client/execution_profile/index.html) for the request timeout and consistency defaults.

### Paging and Memory

The driver fetches query results in pages of 5,000 rows, and the connector assembles them into Arrow record batches of 8,192 rows. Results are streamed to the query rather than loaded whole. A query without a partition-key filter still transfers the whole table on every execution; see [Performance](./performance.md) for how to avoid that with key filters and acceleration.

## Datacenter Routing

Without `scylladb_datacenter`, the driver treats every node in the cluster as local when it routes requests.

With `scylladb_datacenter` set, the driver sends requests only to nodes in that datacenter. Datacenter failover is off in the driver's [load-balancing policy](https://docs.rs/scylla/1.6.0/scylla/policies/load_balancing/struct.DefaultPolicyBuilder.html), so if every node in the named datacenter is unavailable, queries fail rather than moving to another datacenter.

## Metrics

The connector does not register component metrics. If a dataset enables metrics in its `metrics` section, the runtime logs `Dataset <name> does not support metrics. Skipping metric registration for <metrics>.` at `WARN` and continues. See [Component Metrics](../../../features/observability/component_metrics) for the connectors that do.

## Observability and Task History

Queries and acceleration refreshes against ScyllaDB datasets are recorded in [task history](../../../reference/task_history) as their enclosing query and refresh tasks. The connector does not add spans or log lines of its own, so connection and query failures appear as the error of the failing dataset load, query, or refresh.

## Known Limitations

- TLS is not supported, and `scylladb_ssl` has no effect.
- The connector is read-only.
- Pool size, request timeout, and consistency level cannot be configured.
- With `scylladb_datacenter` set, queries do not fail over to another datacenter.
- The ScyllaDB connector is available in the Spice [Enterprise edition](https://docs.spice.ai/docs/enterprise/getting-started/distributions) and is not included in the default open source build.

## Troubleshooting

| Symptom                                                     | Likely cause                                                        | Resolution                                                                                    |
| ----------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `Cannot connect to the dataset <name> (scylladb) on <hosts>:<port>` | No host resolved or accepted a TCP connection on the port.          | Check DNS, firewall rules, and `scylladb_port` for every host in the list.                    |
| `... Authentication failed. Ensure that the username and password are correctly configured in the spicepod.` | Wrong credentials, or `scylladb_user` set without `scylladb_pass`. | Check both parameters and the secret they resolve from.                                       |
| `Missing required parameter: 'scylladb_host'`               | Neither `scylladb_host` nor `scylladb_hosts` is set.                | Set one of them.                                                                              |
| Queries fail when one datacenter is down                    | `scylladb_datacenter` restricts requests to that datacenter.        | Restore the datacenter, or point the dataset at another datacenter.                          |
| Intermittent refresh failures over a slow link              | `connection_timeout` is too short for the network.                  | Raise `connection_timeout`. See [Adjust Connection Timeout](./performance.md#adjust-connection-timeout). |

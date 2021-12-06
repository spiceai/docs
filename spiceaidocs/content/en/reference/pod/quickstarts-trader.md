---
type: docs
title: "Trader"
linkTitle: "Example - Trader"
weight: 70
---

From: https://github.com/spiceai/quickstarts/tree/trunk/trader

```yaml
name: trader
params:
  epoch_time: 1605312000
  granularity: 30m
  interval: 6h
  period: 72h
  episodes: 10
dataspaces:
  - from: coinbase
    name: btcusd
    measurements:
      - name: close
    data:
      connector:
        name: file
        params:
          path: spicepods/data/btcusd.csv
      processor:
        name: csv
  - from: local
    name: portfolio
    measurements:
      - name: usd_balance
        initializer: 0 # update with the starting balance to train with
      - name: btc_balance
        initializer: 0 # update with the starting balance to train with
    actions:
      small_buy: |
        usd_balance -= args.price
        btc_balance += 1
      large_buy: |
        usd_balance -= args.price
        btc_balance += 10
      sell: |
        usd_balance += args.price 
        btc_balance -= 1
    laws:
      - usd_balance >= 0
      - btc_balance >= 0

actions:
  - name: small_buy
    do:
      name: local.portfolio.small_buy
      args:
        price: coinbase.btcusd.close

  - name: large_buy
    do:
      name: local.portfolio.large_buy
      args:
        price: coinbase.btcusd.close

  - name: sell
    do:
      name: local.portfolio.sell
      args:
        price: coinbase.btcusd.close

  - name: hold

training:
  # Compute price change between previous state and this one
  # so it can be used in all three reward functions
  reward_init: |
    prev_price = current_state.coinbase.btcusd.close
    new_price = next_state.coinbase_btcusd_close
    change_in_price = new_price - prev_price

  rewards:
    - reward: small_buy
      # Reward buying when the price decreases
      # Penalize buying when the price increases
      with: |
        reward = -change_in_price

    - reward: large_buy
      # Reward buying when the price decreases
      # Penalize buying when the price increases
      with: |
        reward = -10 * change_in_price

    - reward: sell
      # Reward selling when the price increases
      # Penalize selling when the price decreases
      with: |
        reward = change_in_price

    - reward: hold
      # Penalize holding slightly to incentivize more frequent trading
      # Holding during large price movements will be penalized more harshly
      with: |
        if change_in_price > 0:
          reward = -0.1
        else:
          reward = 0.1
```

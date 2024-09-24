"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[8574],{9389:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>l,contentTitle:()=>t,default:()=>h,frontMatter:()=>r,metadata:()=>d,toc:()=>a});var i=s(4848),c=s(8453);const r={title:"Manifest syntax for Spicepods",sidebar_position:1,sidebar_label:"Spicepod specification",description:"Detailed documentation on the Spicepod manifest syntax (spicepod.yaml)"},t=void 0,d={id:"reference/spicepod/index",title:"Manifest syntax for Spicepods",description:"Detailed documentation on the Spicepod manifest syntax (spicepod.yaml)",source:"@site/docs/reference/spicepod/index.md",sourceDirName:"reference/spicepod",slug:"/reference/spicepod/",permalink:"/reference/spicepod/",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/reference/spicepod/index.md",tags:[],version:"current",sidebarPosition:1,frontMatter:{title:"Manifest syntax for Spicepods",sidebar_position:1,sidebar_label:"Spicepod specification",description:"Detailed documentation on the Spicepod manifest syntax (spicepod.yaml)"},sidebar:"docsSidebar",previous:{title:"Reference",permalink:"/reference/"},next:{title:"Catalogs",permalink:"/reference/spicepod/catalogs"}},l={},a=[{value:"About YAML syntax for Spicepod manifests (spicepod.yaml)",id:"about-yaml-syntax-for-spicepod-manifests-spicepodyaml",level:2},{value:"<code>version</code>",id:"version",level:2},{value:"<code>kind</code>",id:"kind",level:2},{value:"<code>name</code>",id:"name",level:2},{value:"<code>secrets</code>",id:"secrets",level:2},{value:"<code>secrets.from</code>",id:"secretsfrom",level:3},{value:"<code>secrets.name</code>",id:"secretsname",level:3},{value:"<code>runtime</code>",id:"runtime",level:2},{value:"<code>runtime.num_of_parallel_loading_at_start_up</code>",id:"runtimenum_of_parallel_loading_at_start_up",level:3},{value:"<code>runtime.results_cache</code>",id:"runtimeresults_cache",level:3},{value:"<code>runtime.tls</code>",id:"runtimetls",level:3},{value:"<code>runtime.tls.enabled</code>",id:"runtimetlsenabled",level:4},{value:"<code>runtime.tls.certificate</code>",id:"runtimetlscertificate",level:4},{value:"<code>runtime.tls.certificate_file</code>",id:"runtimetlscertificate_file",level:4},{value:"<code>runtime.tls.key</code>",id:"runtimetlskey",level:4},{value:"<code>runtime.tls.key_file</code>",id:"runtimetlskey_file",level:4},{value:"<code>runtime.task_history</code>",id:"runtimetask_history",level:3},{value:"<code>metadata</code>",id:"metadata",level:2},{value:"<code>datasets</code>",id:"datasets",level:2},{value:"<code>models</code>",id:"models",level:2},{value:"<code>embeddings</code>",id:"embeddings",level:2},{value:"<code>dependencies</code>",id:"dependencies",level:2}];function o(e){const n={a:"a",code:"code",h2:"h2",h3:"h3",h4:"h4",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,c.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.h2,{id:"about-yaml-syntax-for-spicepod-manifests-spicepodyaml",children:"About YAML syntax for Spicepod manifests (spicepod.yaml)"}),"\n",(0,i.jsxs)(n.p,{children:["Spicepod manifests use YAML syntax and must be named ",(0,i.jsx)(n.code,{children:"spicepod.yaml"})," or ",(0,i.jsx)(n.code,{children:"spicepod.yml"}),". If you're new to YAML and want to learn more, see \"",(0,i.jsx)(n.a,{href:"https://learnxinyminutes.com/docs/yaml/",children:"Learn YAML in Y minutes"}),'."']}),"\n",(0,i.jsx)(n.p,{children:"Spicepod manifest files are stored in the root directory of your application code."}),"\n",(0,i.jsx)(n.h2,{id:"version",children:(0,i.jsx)(n.code,{children:"version"})}),"\n",(0,i.jsxs)(n.p,{children:["The version of the Spicepod manifest. The current version is ",(0,i.jsx)(n.code,{children:"v1beta1"}),"."]}),"\n",(0,i.jsx)(n.h2,{id:"kind",children:(0,i.jsx)(n.code,{children:"kind"})}),"\n",(0,i.jsxs)(n.p,{children:["The kind of Spicepod manifest. The kind is ",(0,i.jsx)(n.code,{children:"Spicepod"}),"."]}),"\n",(0,i.jsx)(n.h2,{id:"name",children:(0,i.jsx)(n.code,{children:"name"})}),"\n",(0,i.jsx)(n.p,{children:"The name of the Spicepod."}),"\n",(0,i.jsx)(n.h2,{id:"secrets",children:(0,i.jsx)(n.code,{children:"secrets"})}),"\n",(0,i.jsxs)(n.p,{children:["The secrets section in the Spicepod manifest is optional and is used to configure how secrets are stored and accessed by the Spicepod. ",(0,i.jsx)(n.a,{href:"/components/secret-stores",children:"Learn more"}),"."]}),"\n",(0,i.jsx)(n.h3,{id:"secretsfrom",children:(0,i.jsx)(n.code,{children:"secrets.from"})}),"\n",(0,i.jsxs)(n.p,{children:["The ",(0,i.jsx)(n.code,{children:"from"})," field is a string that represents the Uniform Resource Identifier (URI) for the secret store. This URI is composed of two parts: a prefix indicating the Secret Store to use, and an optional selector that specifies the secret to retrieve."]}),"\n",(0,i.jsxs)(n.p,{children:["The syntax for the ",(0,i.jsx)(n.code,{children:"from"})," field is as follows:"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"from: <secret_store>:<selector>\n"})}),"\n",(0,i.jsx)(n.p,{children:"Where:"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"<secret_store>"}),": The Secret Store to use"]}),"\n",(0,i.jsx)(n.p,{children:"Currently supported secret stores:"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/components/secret-stores/env/",children:(0,i.jsx)(n.code,{children:"env"})})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/components/secret-stores/kubernetes/",children:(0,i.jsx)(n.code,{children:"kubernetes"})})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/components/secret-stores/keyring/",children:(0,i.jsx)(n.code,{children:"keyring"})})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"/components/secret-stores/aws-secrets-manager/",children:(0,i.jsx)(n.code,{children:"aws-secrets-manager"})})}),"\n"]}),"\n",(0,i.jsxs)(n.p,{children:["If no secret stores are explicitly specified, it defaults to ",(0,i.jsx)(n.code,{children:"env"}),"."]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"<selector>"}),": The secret within the secret store to load."]}),"\n"]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"The type of secret store for reading secrets."}),"\n",(0,i.jsx)(n.p,{children:"Example"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"secrets:\n  - from: env\n    name: env\n"})}),"\n",(0,i.jsx)(n.h3,{id:"secretsname",children:(0,i.jsx)(n.code,{children:"secrets.name"})}),"\n",(0,i.jsxs)(n.p,{children:["The name of the secret store. This is used to reference the store in the secret replacement syntax, ",(0,i.jsx)(n.code,{children:"${<secret_store_name>:<key_name>}"}),"."]}),"\n",(0,i.jsx)(n.h2,{id:"runtime",children:(0,i.jsx)(n.code,{children:"runtime"})}),"\n",(0,i.jsx)(n.h3,{id:"runtimenum_of_parallel_loading_at_start_up",children:(0,i.jsx)(n.code,{children:"runtime.num_of_parallel_loading_at_start_up"})}),"\n",(0,i.jsx)(n.p,{children:"This configuration setting determines the maximum number of datasets that can be loaded in parallel during startup. This parallel loading capability accelerates Spice's startup process when multiple datasets are configured."}),"\n",(0,i.jsx)(n.h3,{id:"runtimeresults_cache",children:(0,i.jsx)(n.code,{children:"runtime.results_cache"})}),"\n",(0,i.jsxs)(n.p,{children:["The results cache section specifies runtime cache configuration. ",(0,i.jsx)(n.a,{href:"/features/caching",children:"Learn more"}),"."]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"runtime:\n  results_cache:\n    enabled: true\n    cache_max_size: 128MiB\n    eviction_policy: lru\n    item_ttl: 1s\n"})}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"enabled"})," - optional, ",(0,i.jsx)(n.code,{children:"true"})," by default"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"cache_max_size"})," - optional, maximum cache size. Default is ",(0,i.jsx)(n.code,{children:"128MiB"})]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"eviction_policy"})," - optional, cache replacement policy when the cached data reaches the ",(0,i.jsx)(n.code,{children:"cache_max_size"}),". Default is ",(0,i.jsx)(n.code,{children:"lru"})," - ",(0,i.jsx)(n.a,{href:"https://en.wikipedia.org/wiki/Cache_replacement_policies#LRU",children:"least-recently-used (LRU)"})]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"item_ttl"})," - optional, cache entry expiration time, 1 second by default."]}),"\n"]}),"\n",(0,i.jsx)(n.h3,{id:"runtimetls",children:(0,i.jsx)(n.code,{children:"runtime.tls"})}),"\n",(0,i.jsxs)(n.p,{children:["The TLS section specifies the configuration for enabling Transport Layer Security (TLS) for all endpoints exposed by the runtime. ",(0,i.jsx)(n.a,{href:"/api/tls",children:"Learn more about enabling TLS"}),"."]}),"\n",(0,i.jsxs)(n.p,{children:["In addition to configuring TLS via the manifest, TLS can also be configured via ",(0,i.jsx)(n.code,{children:"spiced"})," command line arguments using with ",(0,i.jsx)(n.code,{children:"--tls-enabled true"})," and ",(0,i.jsx)(n.code,{children:"--tls-certificate"}),"/",(0,i.jsx)(n.code,{children:"--tls-certificate-file"})," and ",(0,i.jsx)(n.code,{children:"--tls-key"}),"/",(0,i.jsx)(n.code,{children:"--tls-key-file"})," flags."]}),"\n",(0,i.jsx)(n.h4,{id:"runtimetlsenabled",children:(0,i.jsx)(n.code,{children:"runtime.tls.enabled"})}),"\n",(0,i.jsx)(n.p,{children:"Enables or disables TLS for the runtime endpoints."}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"runtime:\n  tls:\n    ...\n    enabled: true # or false\n"})}),"\n",(0,i.jsx)(n.h4,{id:"runtimetlscertificate",children:(0,i.jsx)(n.code,{children:"runtime.tls.certificate"})}),"\n",(0,i.jsxs)(n.p,{children:["The TLS certificate to use for securing the runtime endpoints. The certificate can also come from ",(0,i.jsx)(n.a,{href:"/components/secret-stores",children:"secrets"}),"."]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"runtime:\n  tls:\n    ...\n    certificate: |\n      -----BEGIN CERTIFICATE-----\n      ...\n      -----END CERTIFICATE-----\n"})}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"runtime:\n  tls:\n    ...\n    certificate: ${secrets:tls_cert}\n"})}),"\n",(0,i.jsx)(n.h4,{id:"runtimetlscertificate_file",children:(0,i.jsx)(n.code,{children:"runtime.tls.certificate_file"})}),"\n",(0,i.jsxs)(n.p,{children:["The path to the TLS PEM-encoded certificate file. Only one of ",(0,i.jsx)(n.code,{children:"certificate"})," or ",(0,i.jsx)(n.code,{children:"certificate_file"})," must be used."]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"runtime:\n  tls:\n    ...\n    certificate_file: /path/to/cert.pem\n"})}),"\n",(0,i.jsx)(n.h4,{id:"runtimetlskey",children:(0,i.jsx)(n.code,{children:"runtime.tls.key"})}),"\n",(0,i.jsxs)(n.p,{children:["The TLS key to use for securing the runtime endpoints. The key can also come from ",(0,i.jsx)(n.a,{href:"/components/secret-stores",children:"secrets"}),"."]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"runtime:\n  tls:\n    ...\n    key: |\n      -----BEGIN PRIVATE KEY-----\n      ...\n      -----END PRIVATE KEY-----\n"})}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"runtime:\n  tls:\n    ...\n    key: ${secrets:tls_key}\n"})}),"\n",(0,i.jsx)(n.h4,{id:"runtimetlskey_file",children:(0,i.jsx)(n.code,{children:"runtime.tls.key_file"})}),"\n",(0,i.jsxs)(n.p,{children:["The path to the TLS PEM-encoded key file. Only one of ",(0,i.jsx)(n.code,{children:"key"})," or ",(0,i.jsx)(n.code,{children:"key_file"})," must be used."]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"runtime:\n  tls:\n    ...\n    key_file: /path/to/key.pem\n"})}),"\n",(0,i.jsx)(n.h3,{id:"runtimetask_history",children:(0,i.jsx)(n.code,{children:"runtime.task_history"})}),"\n",(0,i.jsx)(n.p,{children:"The task history section specifies runtime task history configuration."}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"runtime:\n  task_history:\n    enabled: true\n    captured_output: truncated\n    retention_period: 8h\n    retention_check_interval: 15m\n"})}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"enabled"})," - optional, ",(0,i.jsx)(n.code,{children:"true"})," by default."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"captured_output"})," - optional, what level of output is captured by the task history table. ",(0,i.jsx)(n.code,{children:"truncated"})," by default. Possible values are ",(0,i.jsx)(n.code,{children:"truncated"}),", or ",(0,i.jsx)(n.code,{children:"none"}),"."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"retention_period"})," - optional, how long records in the task history table should be retained. Default is ",(0,i.jsx)(n.code,{children:"8h"}),", or 8 hours."]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"retention_check_interval"})," - optional, how often should old records be checked for removal. Default is ",(0,i.jsx)(n.code,{children:"15m"}),", or 15 minutes."]}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"metadata",children:(0,i.jsx)(n.code,{children:"metadata"})}),"\n",(0,i.jsxs)(n.p,{children:["An optional ",(0,i.jsx)(n.code,{children:"map"})," of metadata."]}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.strong,{children:"Example"})}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"metadata:\n  epoch_time: 1605312000\n  period: 72h\n  interval: 1m\n  granularity: 10s\n  episodes: 10\n"})}),"\n",(0,i.jsx)(n.h2,{id:"datasets",children:(0,i.jsx)(n.code,{children:"datasets"})}),"\n",(0,i.jsxs)(n.p,{children:["A Spicepod can contain one or more ",(0,i.jsx)(n.a,{href:"/reference/spicepod/datasets",children:"datasets"})," referenced by relative path."]}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.strong,{children:"Example"})}),"\n",(0,i.jsx)(n.p,{children:"A datasets referenced by relative path."}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - ref: datasets/uniswap_v2_eth_usdc\n"})}),"\n",(0,i.jsx)(n.p,{children:"A dataset defined inline."}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - from: spice.ai/eth.recent_blocks\n    name: eth_blocks\n    acceleration:\n      enabled: true\n      refresh_mode: full\n      refresh_check_interval: 1h\n"})}),"\n",(0,i.jsx)(n.h2,{id:"models",children:(0,i.jsx)(n.code,{children:"models"})}),"\n",(0,i.jsxs)(n.p,{children:["A Spicepod can contain one or more ",(0,i.jsx)(n.a,{href:"/reference/spicepod/models",children:"models"})," referenced by relative path."]}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.strong,{children:"Example"})}),"\n",(0,i.jsx)(n.p,{children:"A model referenced by path."}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"models:\n  - from: models/drive_stats\n"})}),"\n",(0,i.jsx)(n.p,{children:"A model defined inline."}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"models:\n  - from: spiceai/lukekim/smart/models/drive_stats:latest\n    name: drive_stats\n    datasets:\n      - drive_stats_inferencing\n"})}),"\n",(0,i.jsx)(n.h2,{id:"embeddings",children:(0,i.jsx)(n.code,{children:"embeddings"})}),"\n",(0,i.jsxs)(n.p,{children:["A Spicepod can contain one or more ",(0,i.jsx)(n.a,{href:"/reference/spicepod/embeddings",children:"embeddings"})," referenced by relative path."]}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.strong,{children:"Example"})}),"\n",(0,i.jsx)(n.p,{children:"An embeddings model referenced by path."}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"embeddings:\n  - from: embeddings/openai_text_embedding_3\n"})}),"\n",(0,i.jsx)(n.p,{children:"An embedding defined inline."}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"embeddings:\n  - name: hf_baai_bge\n    from: huggingface:huggingface.co/BAAI/bge-small-en-v1.5\n"})}),"\n",(0,i.jsx)(n.h2,{id:"dependencies",children:(0,i.jsx)(n.code,{children:"dependencies"})}),"\n",(0,i.jsx)(n.p,{children:"A list of dependent Spicepods."}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"dependencies:\n  - lukekim/demo\n  - spicehq/nfts\n"})})]})}function h(e={}){const{wrapper:n}={...(0,c.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(o,{...e})}):o(e)}},8453:(e,n,s)=>{s.d(n,{R:()=>t,x:()=>d});var i=s(6540);const c={},r=i.createContext(c);function t(e){const n=i.useContext(r);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function d(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(c):e.components||c:t(e.components),i.createElement(r.Provider,{value:n},e.children)}}}]);
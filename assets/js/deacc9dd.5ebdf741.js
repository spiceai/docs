"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[8574],{9389:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>t,contentTitle:()=>r,default:()=>p,frontMatter:()=>d,metadata:()=>a,toc:()=>l});var i=s(4848),c=s(8453);const d={title:"Manifest syntax for Spicepods",sidebar_position:1,sidebar_label:"Spicepod specification",description:"Detailed documentation on the Spicepod manifest syntax (spicepod.yaml)"},r=void 0,a={id:"reference/spicepod/index",title:"Manifest syntax for Spicepods",description:"Detailed documentation on the Spicepod manifest syntax (spicepod.yaml)",source:"@site/docs/reference/spicepod/index.md",sourceDirName:"reference/spicepod",slug:"/reference/spicepod/",permalink:"/reference/spicepod/",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/reference/spicepod/index.md",tags:[],version:"current",sidebarPosition:1,frontMatter:{title:"Manifest syntax for Spicepods",sidebar_position:1,sidebar_label:"Spicepod specification",description:"Detailed documentation on the Spicepod manifest syntax (spicepod.yaml)"},sidebar:"docsSidebar",previous:{title:"Reference",permalink:"/reference/"},next:{title:"Datasets",permalink:"/reference/spicepod/datasets"}},t={},l=[{value:"About YAML syntax for Spicepod manifests (spicepod.yaml)",id:"about-yaml-syntax-for-spicepod-manifests-spicepodyaml",level:2},{value:"<code>version</code>",id:"version",level:2},{value:"<code>kind</code>",id:"kind",level:2},{value:"<code>name</code>",id:"name",level:2},{value:"<code>secrets</code>",id:"secrets",level:2},{value:"<code>secrets.store</code>",id:"secretsstore",level:3},{value:"<code>runtime</code>",id:"runtime",level:2},{value:"<code>num_of_parallel_loading_at_start_up</code>",id:"num_of_parallel_loading_at_start_up",level:3},{value:"<code>results_cache</code>",id:"results_cache",level:3},{value:"<code>metadata</code>",id:"metadata",level:2},{value:"<code>datasets</code>",id:"datasets",level:2},{value:"<code>models</code>",id:"models",level:2},{value:"<code>dependencies</code>",id:"dependencies",level:2}];function o(e){const n={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,c.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.h2,{id:"about-yaml-syntax-for-spicepod-manifests-spicepodyaml",children:"About YAML syntax for Spicepod manifests (spicepod.yaml)"}),"\n",(0,i.jsxs)(n.p,{children:["Spicepod manifests use YAML syntax and must be named ",(0,i.jsx)(n.code,{children:"spicepod.yaml"})," or ",(0,i.jsx)(n.code,{children:"spicepod.yml"}),". If you're new to YAML and want to learn more, see \"",(0,i.jsx)(n.a,{href:"https://learnxinyminutes.com/docs/yaml/",children:"Learn YAML in Y minutes"}),'."']}),"\n",(0,i.jsx)(n.p,{children:"Spicepod manifest files are stored in the root directory of your application code."}),"\n",(0,i.jsx)(n.h2,{id:"version",children:(0,i.jsx)(n.code,{children:"version"})}),"\n",(0,i.jsxs)(n.p,{children:["The version of the Spicepod manifest. The current version is ",(0,i.jsx)(n.code,{children:"v1beta1"}),"."]}),"\n",(0,i.jsx)(n.h2,{id:"kind",children:(0,i.jsx)(n.code,{children:"kind"})}),"\n",(0,i.jsxs)(n.p,{children:["The kind of Spicepod manifest. The kind is ",(0,i.jsx)(n.code,{children:"Spicepod"}),"."]}),"\n",(0,i.jsx)(n.h2,{id:"name",children:(0,i.jsx)(n.code,{children:"name"})}),"\n",(0,i.jsx)(n.p,{children:"The name of the Spicepod."}),"\n",(0,i.jsx)(n.h2,{id:"secrets",children:(0,i.jsx)(n.code,{children:"secrets"})}),"\n",(0,i.jsxs)(n.p,{children:["The secrets section in the Spicepod manifest is optional and is used to configure how secrets are stored and accessed by the Spicepod. ",(0,i.jsx)(n.a,{href:"/secret-stores",children:"Learn more"}),"."]}),"\n",(0,i.jsx)(n.h3,{id:"secretsstore",children:(0,i.jsx)(n.code,{children:"secrets.store"})}),"\n",(0,i.jsx)(n.p,{children:"The type of secret store for reading secrets."}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"file"})," (default)"]}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.code,{children:"env"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.code,{children:"kubernetes"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.code,{children:"keyring"})}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"Example"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"secrets:\n  store: env\n"})}),"\n",(0,i.jsx)(n.h2,{id:"runtime",children:(0,i.jsx)(n.code,{children:"runtime"})}),"\n",(0,i.jsx)(n.h3,{id:"num_of_parallel_loading_at_start_up",children:(0,i.jsx)(n.code,{children:"num_of_parallel_loading_at_start_up"})}),"\n",(0,i.jsx)(n.p,{children:"This configuration setting determines the maximum number of datasets that can be loaded in parallel during startup. This parallel loading capability accelerates Spice's startup process when multiple datasets are configured."}),"\n",(0,i.jsx)(n.h3,{id:"results_cache",children:(0,i.jsx)(n.code,{children:"results_cache"})}),"\n",(0,i.jsxs)(n.p,{children:["The results cache section specifies runtime cache configuration. ",(0,i.jsx)(n.a,{href:"/features/caching",children:"Learn more"}),"."]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"runtime:\n  results_cache:\n    enabled: true\n    cache_max_size: 128MiB\n    eviction_policy: lru \n    item_ttl: 1s\n"})}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"enabled"})," - optional, ",(0,i.jsx)(n.code,{children:"true"})," by default"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"cache_max_size"})," - optional, maximum cache size. Default is ",(0,i.jsx)(n.code,{children:"128MiB"})]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"eviction_policy"})," - optional, cache replacement policy when the cached data reaches the ",(0,i.jsx)(n.code,{children:"cache_max_size"}),". Default is ",(0,i.jsx)(n.code,{children:"lru"})," - ",(0,i.jsx)(n.a,{href:"https://en.wikipedia.org/wiki/Cache_replacement_policies#LRU",children:"least-recently-used (LRU)"})]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"item_ttl"})," - optional, cache entry expiration time, 1 second by default."]}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"metadata",children:(0,i.jsx)(n.code,{children:"metadata"})}),"\n",(0,i.jsxs)(n.p,{children:["An optional ",(0,i.jsx)(n.code,{children:"map"})," of metadata."]}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.strong,{children:"Example"})}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"metadata:\n  epoch_time: 1605312000\n  period: 72h\n  interval: 1m\n  granularity: 10s\n  episodes: 10\n"})}),"\n",(0,i.jsx)(n.h2,{id:"datasets",children:(0,i.jsx)(n.code,{children:"datasets"})}),"\n",(0,i.jsxs)(n.p,{children:["A Spicepod can contain one or more ",(0,i.jsx)(n.a,{href:"/reference/spicepod/datasets",children:"datasets"})," referenced by relative path."]}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.strong,{children:"Example"})}),"\n",(0,i.jsx)(n.p,{children:"A datasets referenced by relative path."}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - ref: datasets/uniswap_v2_eth_usdc\n"})}),"\n",(0,i.jsx)(n.p,{children:"A dataset defined inline."}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - from: spice.ai/eth.recent_blocks\n    name: eth_blocks\n    acceleration:\n      enabled: true\n      refresh_mode: full\n      refresh_check_interval: 1h\n"})}),"\n",(0,i.jsx)(n.h2,{id:"models",children:(0,i.jsx)(n.code,{children:"models"})}),"\n",(0,i.jsxs)(n.p,{children:["A Spicepod can contain one or more ",(0,i.jsx)(n.a,{href:"/reference/spicepod/models",children:"models"})," referenced by relative path."]}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.strong,{children:"Example"})}),"\n",(0,i.jsx)(n.p,{children:"A model referenced by path."}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"models:\n  - from: models/drive_stats\n"})}),"\n",(0,i.jsx)(n.p,{children:"A model defined inline."}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"models:\n  - from: spiceai:spice.ai/lukekim/smart/models/drive_stats:latest\n    name: drive_stats\n    datasets:\n      - drive_stats_inferencing\n"})}),"\n",(0,i.jsx)(n.h2,{id:"dependencies",children:(0,i.jsx)(n.code,{children:"dependencies"})}),"\n",(0,i.jsx)(n.p,{children:"A list of dependent Spicepods."}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-yaml",children:"dependencies:\n  - lukekim/demo\n  - spicehq/nfts\n"})})]})}function p(e={}){const{wrapper:n}={...(0,c.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(o,{...e})}):o(e)}},8453:(e,n,s)=>{s.d(n,{R:()=>r,x:()=>a});var i=s(6540);const c={},d=i.createContext(c);function r(e){const n=i.useContext(d);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(c):e.components||c:r(e.components),i.createElement(d.Provider,{value:n},e.children)}}}]);
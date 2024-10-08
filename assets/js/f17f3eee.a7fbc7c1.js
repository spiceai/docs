"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[3161],{8232:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>o,contentTitle:()=>c,default:()=>u,frontMatter:()=>s,metadata:()=>i,toc:()=>l});var r=t(4848),a=t(8453);t(1470),t(9365);const s={title:"Azure BlobFS Data Connector",sidebar_label:"Azure BlobFS Data Connector",description:"Azure BlobFS Data Connector Documentation"},c=void 0,i={id:"components/data-connectors/abfs",title:"Azure BlobFS Data Connector",description:"Azure BlobFS Data Connector Documentation",source:"@site/docs/components/data-connectors/abfs.md",sourceDirName:"components/data-connectors",slug:"/components/data-connectors/abfs",permalink:"/components/data-connectors/abfs",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/components/data-connectors/abfs.md",tags:[],version:"current",frontMatter:{title:"Azure BlobFS Data Connector",sidebar_label:"Azure BlobFS Data Connector",description:"Azure BlobFS Data Connector Documentation"},sidebar:"docsSidebar",previous:{title:"Data Connectors",permalink:"/components/data-connectors/"},next:{title:"Clickhouse Data Connector",permalink:"/components/data-connectors/clickhouse"}},o={},l=[{value:"Dataset Schema Reference",id:"dataset-schema-reference",level:2},{value:"<code>from</code>",id:"from",level:3},{value:"<code>name</code>",id:"name",level:3},{value:"<code>params</code>",id:"params",level:3},{value:"Basic parameters",id:"basic-parameters",level:4},{value:"Authentication parameters",id:"authentication-parameters",level:4},{value:"Retry parameters",id:"retry-parameters",level:4},{value:"File format parameters",id:"file-format-parameters",level:4},{value:"Examples",id:"examples",level:2},{value:"Reading a CSV file using an Access Key",id:"reading-a-csv-file-using-an-access-key",level:3},{value:"Reading from a public container",id:"reading-from-a-public-container",level:3},{value:"Using secrets for container and account name",id:"using-secrets-for-container-and-account-name",level:3},{value:"Connecting to the Storage Emulator",id:"connecting-to-the-storage-emulator",level:3},{value:"Authenticating using Client Authentication",id:"authenticating-using-client-authentication",level:3}];function d(e){const n={a:"a",admonition:"admonition",code:"code",h2:"h2",h3:"h3",h4:"h4",li:"li",p:"p",pre:"pre",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,a.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)(n.p,{children:["The Azure BlobFS (ABFS) Data Connector enables federated SQL query on files stored in Azure Blob-compatible endpoints. This includes Azure BlobFS (",(0,r.jsx)(n.code,{children:"abfss://"}),") and Azure Data Lake (",(0,r.jsx)(n.code,{children:"adl://"}),") endpoints."]}),"\n",(0,r.jsx)(n.p,{children:"If a folder path is provided, all child files will be loaded."}),"\n",(0,r.jsxs)(n.p,{children:["File formats are specified using the ",(0,r.jsx)(n.code,{children:"file_format"})," parameter, as described in ",(0,r.jsx)(n.a,{href:"/components/data-connectors/#object-store-file-formats",children:"Object Store File Formats"}),"."]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - from: abfs://foocontainer/taxi_sample.csv\n    name: azure_test\n    params:\n      azure_account: spiceadls\n      azure_access_key: abc123==\n      file_format: csv\n"})}),"\n",(0,r.jsx)(n.h2,{id:"dataset-schema-reference",children:"Dataset Schema Reference"}),"\n",(0,r.jsx)(n.h3,{id:"from",children:(0,r.jsx)(n.code,{children:"from"})}),"\n",(0,r.jsx)(n.p,{children:"The ABFS-compatible URI to a folder or object in one of two forms:"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"from: abfs://<container>/<path>"})," with the account name configured using ",(0,r.jsx)(n.code,{children:"abfs_account"})," parameter, or"]}),"\n",(0,r.jsx)(n.li,{children:(0,r.jsx)(n.code,{children:"from: abfs://<container>@<account_name>.dfs.core.windows.net/<path>"})}),"\n"]}),"\n",(0,r.jsxs)(n.admonition,{type:"note",children:[(0,r.jsxs)(n.p,{children:["A valid URI must always be specified in the ",(0,r.jsx)(n.code,{children:"from"})," field, even if you are setting the account or container name using ",(0,r.jsx)(n.a,{href:"/components/secret-stores/",children:"secrets"}),". When using secrets use a dummy account/container name and the values will be replaced with the values contained by the secrets at runtime."]}),(0,r.jsxs)(n.p,{children:["See the example ",(0,r.jsx)(n.a,{href:"#using-secrets-for-container-and-account-name",children:"below"}),"."]})]}),"\n",(0,r.jsx)(n.h3,{id:"name",children:(0,r.jsx)(n.code,{children:"name"})}),"\n",(0,r.jsx)(n.p,{children:"The dataset name. This will be used as the table name within Spice."}),"\n",(0,r.jsxs)(n.p,{children:["Example: ",(0,r.jsx)(n.code,{children:"name: cool_dataset"})]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-sql",children:"SELECT COUNT(*) FROM cool_dataset\n"})}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-shell",children:"+----------+\n| count(*) |\n+----------+\n| 6001215  |\n+----------+\n"})}),"\n",(0,r.jsx)(n.h3,{id:"params",children:(0,r.jsx)(n.code,{children:"params"})}),"\n",(0,r.jsx)(n.h4,{id:"basic-parameters",children:"Basic parameters"}),"\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter name"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"abfs_account"})}),(0,r.jsx)(n.td,{children:"Azure storage account name"})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"abfs_container_name"})}),(0,r.jsx)(n.td,{children:"Azure storage container name"})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"abfs_sas_string"})}),(0,r.jsx)(n.td,{children:"SAS Token to use for authorization"})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"abfs_endpoint"})}),(0,r.jsxs)(n.td,{children:["Storage endpoint to connect to. Defaults to ",(0,r.jsx)(n.code,{children:"https://{account}.blob.core.windows.net"})]})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"abfs_use_emulator"})}),(0,r.jsxs)(n.td,{children:["Connect to a locally-running Azure Storage emulator. Valid values are ",(0,r.jsx)(n.code,{children:"true"})," or ",(0,r.jsx)(n.code,{children:"false"})]})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"abfs_allow_http"})}),(0,r.jsx)(n.td,{children:"Allow insecure HTTP connections"})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"abfs_authority_host"})}),(0,r.jsxs)(n.td,{children:["Use an alternative authority host. Defaults to ",(0,r.jsx)(n.code,{children:"https://login.microsoftonline.com"})]})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"abfs_proxy_url"})}),(0,r.jsx)(n.td,{children:"Proxy URL to use when connecting"})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"abfs_proxy_ca_certificate"})}),(0,r.jsx)(n.td,{children:"A trusted CA certificate for the proxy"})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"abfs_proxy_exludes"})}),(0,r.jsx)(n.td,{children:"A list of hosts to exclude from proxy connections"})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"abfs_disable_tagging"})}),(0,r.jsxs)(n.td,{children:["Ignore any tags provided to ",(0,r.jsx)(n.code,{children:"put_opts"})]})]})]})]}),"\n",(0,r.jsx)(n.h4,{id:"authentication-parameters",children:"Authentication parameters"}),"\n",(0,r.jsxs)(n.p,{children:["The following parameters are used when authenticating with Azure. Only one of ",(0,r.jsx)(n.code,{children:"abfs_access_key"}),", ",(0,r.jsx)(n.code,{children:"abfs_bearer_token"}),", ",(0,r.jsx)(n.code,{children:"abfs_client_secret"})," or ",(0,r.jsx)(n.code,{children:"abfs_skip_signature"})," can be set at the same time. If none of these are set the connector will default to using a ",(0,r.jsx)(n.a,{href:"https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview",children:"managed identity"})]}),"\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter name"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"abfs_access_key"})}),(0,r.jsx)(n.td,{children:"Secret access key to use when authenticating"})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"abfs_bearer_token"})}),(0,r.jsxs)(n.td,{children:[(0,r.jsx)(n.code,{children:"BEARER"})," token to use when authenticating"]})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"abfs_client_id"})}),(0,r.jsx)(n.td,{children:"Client ID to use with the client authentication flow"})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"abfs_client_secret"})}),(0,r.jsx)(n.td,{children:"Client Secret to use with the client authentication flow"})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"abfs_tenant_id"})}),(0,r.jsx)(n.td,{children:"Tenant ID to use with client authentication flow"})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"abfs_skip_signature"})}),(0,r.jsx)(n.td,{children:"Skip fetching credentials and skip signing requests. Used for interacting with public containers"})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"abfs_msi_endpoint"})}),(0,r.jsx)(n.td,{children:"The endpoing to use for acquiring managed identity tokens"})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"abfs_federated_token_file"})}),(0,r.jsx)(n.td,{children:"File path for acquiring Azure federated identity token in Kubernetes"})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"abfs_use_cli"})}),(0,r.jsxs)(n.td,{children:["Set to ",(0,r.jsx)(n.code,{children:"true"})," to use the Azure CLI to acquire access tokens"]})]})]})]}),"\n",(0,r.jsx)(n.h4,{id:"retry-parameters",children:"Retry parameters"}),"\n",(0,r.jsxs)(n.table,{children:[(0,r.jsx)(n.thead,{children:(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.th,{children:"Parameter name"}),(0,r.jsx)(n.th,{children:"Description"})]})}),(0,r.jsxs)(n.tbody,{children:[(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"abfs_max_retries"})}),(0,r.jsx)(n.td,{children:"Maximum number of retries"})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"abfs_retry_timeout"})}),(0,r.jsxs)(n.td,{children:["Timeout for all retries. Accepts any duration string (i.e ",(0,r.jsx)(n.code,{children:"5s"}),", ",(0,r.jsx)(n.code,{children:"1m"}),", etc)"]})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"abfs_backoff_initial_duration"})}),(0,r.jsxs)(n.td,{children:["How long to wait before the initial retry. Accepts any duration string (i.e ",(0,r.jsx)(n.code,{children:"5s"}),", ",(0,r.jsx)(n.code,{children:"1m"}),", etc)"]})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"abfs_backoff_max_duration"})}),(0,r.jsxs)(n.td,{children:["Maximum length to wait for a retry. Accepts any duration string (i.e ",(0,r.jsx)(n.code,{children:"5s"}),", ",(0,r.jsx)(n.code,{children:"1m"}),", etc)"]})]}),(0,r.jsxs)(n.tr,{children:[(0,r.jsx)(n.td,{children:(0,r.jsx)(n.code,{children:"abfs_backoff_base"})}),(0,r.jsx)(n.td,{children:"Floating-point base of the exponential to use when backing off retries"})]})]})]}),"\n",(0,r.jsx)(n.h4,{id:"file-format-parameters",children:"File format parameters"}),"\n",(0,r.jsxs)(n.p,{children:["File formats are specified using the ",(0,r.jsx)(n.code,{children:"file_format"})," parameter, as described in ",(0,r.jsx)(n.a,{href:"/components/data-connectors/#object-store-file-formats",children:"Object Store File Formats"}),"."]}),"\n",(0,r.jsx)(n.h2,{id:"examples",children:"Examples"}),"\n",(0,r.jsx)(n.h3,{id:"reading-a-csv-file-using-an-access-key",children:"Reading a CSV file using an Access Key"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - from: abfs://foocontainer/taxi_sample.csv\n    name: azure_test\n    params:\n      abfs_account: spiceadls\n      abfs_access_key: abc123==\n      file_format: csv\n"})}),"\n",(0,r.jsx)(n.h3,{id:"reading-from-a-public-container",children:"Reading from a public container"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - from: abfs://pubcontainer/taxi_sample.csv\n    name: pub_data\n    params:\n      abfs_account: spiceadls\n      abfs_skip_signature: true\n      file_format: csv\n"})}),"\n",(0,r.jsx)(n.h3,{id:"using-secrets-for-container-and-account-name",children:"Using secrets for container and account name"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  # dummy_container will be overridden by the value in `abfs_container`\n  - from: abfs://dummy_container/my_csv.csv\n    name: prod_data\n    params:\n      abfs_account: ${ secrets:PROD_ACCOUNT }\n      abfs_container: ${ secrets:PROD_CONTAINER }\n      file_format: csv\n"})}),"\n",(0,r.jsx)(n.h3,{id:"connecting-to-the-storage-emulator",children:"Connecting to the Storage Emulator"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - from: abfs://test_container/test_csv.csv\n    name: test_data\n    params:\n      abfs_use_emulator: true\n      file_format: csv\n"})}),"\n",(0,r.jsx)(n.h3,{id:"authenticating-using-client-authentication",children:"Authenticating using Client Authentication"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - from: abfs://my_data/input.parquet\n    name: my_data\n    params:\n      abfs_tentant_id: B3E1A8F4-9D5B-4D3B-8D2E-1F4A9D5B4D3B\n      abfs_client_id: ${ secrets:MY_CLIENT_ID }\n      abfs_client_secret: ${ secrets:MY_CLIENT_SECRET }\n"})})]})}function u(e={}){const{wrapper:n}={...(0,a.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(d,{...e})}):d(e)}},9365:(e,n,t)=>{t.d(n,{A:()=>c});t(6540);var r=t(4164);const a={tabItem:"tabItem_Ymn6"};var s=t(4848);function c(e){let{children:n,hidden:t,className:c}=e;return(0,s.jsx)("div",{role:"tabpanel",className:(0,r.A)(a.tabItem,c),hidden:t,children:n})}},1470:(e,n,t)=>{t.d(n,{A:()=>y});var r=t(6540),a=t(4164),s=t(3104),c=t(6347),i=t(205),o=t(7485),l=t(1682),d=t(679);function u(e){return r.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,r.isValidElement)(e)&&function(e){const{props:n}=e;return!!n&&"object"==typeof n&&"value"in n}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function h(e){const{values:n,children:t}=e;return(0,r.useMemo)((()=>{const e=n??function(e){return u(e).map((e=>{let{props:{value:n,label:t,attributes:r,default:a}}=e;return{value:n,label:t,attributes:r,default:a}}))}(t);return function(e){const n=(0,l.XI)(e,((e,n)=>e.value===n.value));if(n.length>0)throw new Error(`Docusaurus error: Duplicate values "${n.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[n,t])}function m(e){let{value:n,tabValues:t}=e;return t.some((e=>e.value===n))}function f(e){let{queryString:n=!1,groupId:t}=e;const a=(0,c.W6)(),s=function(e){let{queryString:n=!1,groupId:t}=e;if("string"==typeof n)return n;if(!1===n)return null;if(!0===n&&!t)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return t??null}({queryString:n,groupId:t});return[(0,o.aZ)(s),(0,r.useCallback)((e=>{if(!s)return;const n=new URLSearchParams(a.location.search);n.set(s,e),a.replace({...a.location,search:n.toString()})}),[s,a])]}function x(e){const{defaultValue:n,queryString:t=!1,groupId:a}=e,s=h(e),[c,o]=(0,r.useState)((()=>function(e){let{defaultValue:n,tabValues:t}=e;if(0===t.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(n){if(!m({value:n,tabValues:t}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${n}" but none of its children has the corresponding value. Available values are: ${t.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return n}const r=t.find((e=>e.default))??t[0];if(!r)throw new Error("Unexpected error: 0 tabValues");return r.value}({defaultValue:n,tabValues:s}))),[l,u]=f({queryString:t,groupId:a}),[x,j]=function(e){let{groupId:n}=e;const t=function(e){return e?`docusaurus.tab.${e}`:null}(n),[a,s]=(0,d.Dv)(t);return[a,(0,r.useCallback)((e=>{t&&s.set(e)}),[t,s])]}({groupId:a}),p=(()=>{const e=l??x;return m({value:e,tabValues:s})?e:null})();(0,i.A)((()=>{p&&o(p)}),[p]);return{selectedValue:c,selectValue:(0,r.useCallback)((e=>{if(!m({value:e,tabValues:s}))throw new Error(`Can't select invalid tab value=${e}`);o(e),u(e),j(e)}),[u,j,s]),tabValues:s}}var j=t(2303);const p={tabList:"tabList__CuJ",tabItem:"tabItem_LNqP"};var b=t(4848);function g(e){let{className:n,block:t,selectedValue:r,selectValue:c,tabValues:i}=e;const o=[],{blockElementScrollPositionUntilNextRender:l}=(0,s.a_)(),d=e=>{const n=e.currentTarget,t=o.indexOf(n),a=i[t].value;a!==r&&(l(n),c(a))},u=e=>{let n=null;switch(e.key){case"Enter":d(e);break;case"ArrowRight":{const t=o.indexOf(e.currentTarget)+1;n=o[t]??o[0];break}case"ArrowLeft":{const t=o.indexOf(e.currentTarget)-1;n=o[t]??o[o.length-1];break}}n?.focus()};return(0,b.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,a.A)("tabs",{"tabs--block":t},n),children:i.map((e=>{let{value:n,label:t,attributes:s}=e;return(0,b.jsx)("li",{role:"tab",tabIndex:r===n?0:-1,"aria-selected":r===n,ref:e=>o.push(e),onKeyDown:u,onClick:d,...s,className:(0,a.A)("tabs__item",p.tabItem,s?.className,{"tabs__item--active":r===n}),children:t??n},n)}))})}function _(e){let{lazy:n,children:t,selectedValue:s}=e;const c=(Array.isArray(t)?t:[t]).filter(Boolean);if(n){const e=c.find((e=>e.props.value===s));return e?(0,r.cloneElement)(e,{className:(0,a.A)("margin-top--md",e.props.className)}):null}return(0,b.jsx)("div",{className:"margin-top--md",children:c.map(((e,n)=>(0,r.cloneElement)(e,{key:n,hidden:e.props.value!==s})))})}function v(e){const n=x(e);return(0,b.jsxs)("div",{className:(0,a.A)("tabs-container",p.tabList),children:[(0,b.jsx)(g,{...n,...e}),(0,b.jsx)(_,{...n,...e})]})}function y(e){const n=(0,j.A)();return(0,b.jsx)(v,{...e,children:u(e.children)},String(n))}},8453:(e,n,t)=>{t.d(n,{R:()=>c,x:()=>i});var r=t(6540);const a={},s=r.createContext(a);function c(e){const n=r.useContext(s);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function i(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:c(e.components),r.createElement(s.Provider,{value:n},e.children)}}}]);
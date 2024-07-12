"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[294],{9366:(e,a,n)=>{n.r(a),n.d(a,{assets:()=>u,contentTitle:()=>o,default:()=>h,frontMatter:()=>c,metadata:()=>i,toc:()=>d});var t=n(4848),r=n(8453),s=n(1470),l=n(9365);const c={title:"Delta Lake Data Connector",sidebar_label:"Delta Lake Data Connector",description:"Delta Lake Data Connector Documentation",pagination_prev:null},o=void 0,i={id:"components/data-connectors/delta-lake",title:"Delta Lake Data Connector",description:"Delta Lake Data Connector Documentation",source:"@site/docs/components/data-connectors/delta-lake.md",sourceDirName:"components/data-connectors",slug:"/components/data-connectors/delta-lake",permalink:"/components/data-connectors/delta-lake",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/components/data-connectors/delta-lake.md",tags:[],version:"current",frontMatter:{title:"Delta Lake Data Connector",sidebar_label:"Delta Lake Data Connector",description:"Delta Lake Data Connector Documentation",pagination_prev:null},sidebar:"docsSidebar",next:{title:"Dremio Data Connector",permalink:"/components/data-connectors/dremio"}},u={},d=[{value:"Configuration",id:"configuration",level:2},{value:"Example",id:"example",level:2},{value:"Auth",id:"auth",level:3}];function p(e){const a={a:"a",code:"code",h2:"h2",h3:"h3",p:"p",pre:"pre",...(0,r.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(a.p,{children:["Query/accelerate ",(0,t.jsx)(a.a,{href:"https://delta.io/",children:"Delta Lake"})," tables in Spice."]}),"\n",(0,t.jsx)(a.h2,{id:"configuration",children:"Configuration"}),"\n",(0,t.jsxs)(a.p,{children:[(0,t.jsx)(a.code,{children:"spice login delta_lake"})," can be used to configure the secrets needed for connecting to Delta Lake tables."]}),"\n",(0,t.jsxs)(s.A,{children:[(0,t.jsx)(l.A,{value:"delta_lake_s3",label:"Delta Lake + S3",children:(0,t.jsx)(a.pre,{children:(0,t.jsx)(a.code,{className:"language-bash",children:"spice login delta_lake --aws-region <aws-region> --aws-access-key-id <aws-access-key-id> --aws-secret-access-key <aws-secret-access-key>\n"})})}),(0,t.jsx)(l.A,{value:"delta_lake_azure",label:"Delta Lake + Azure Blob",children:(0,t.jsx)(a.pre,{children:(0,t.jsx)(a.code,{className:"language-bash",children:"spice login delta_lake --azure-storage-account-name <account-name> --azure-storage-access-key <access-key>\n"})})}),(0,t.jsx)(l.A,{value:"delta_lake_gcp",label:"Delta Lake + Google Storage",children:(0,t.jsx)(a.pre,{children:(0,t.jsx)(a.code,{className:"language-bash",children:"spice login delta_lake --google-service-account-path /path/to/service-account.json\n"})})})]}),"\n",(0,t.jsx)(a.h2,{id:"example",children:"Example"}),"\n",(0,t.jsx)(a.pre,{children:(0,t.jsx)(a.code,{className:"language-yaml",children:"datasets:\n  # Example for local Delta Lake\n  - from: delta_lake:/path/to/local/delta/table  // A local filesystem path to a Delta Lake table\n    name: my_delta_lake_table\n  # Example for Delta Lake on S3\n  - from: delta_lake:s3://my_bucket/path/to/s3/delta/table/  // A reference to a table in S3\n    name: my_delta_lake_table\n  # Example for Delta Lake on Azure Blob\n  - from: delta_lake:abfss://my_container@my_account.dfs.core.windows.net/path/to/azure/delta/table/  // A reference to a table in Azure Blob\n    name: my_delta_lake_table\n"})}),"\n",(0,t.jsx)(a.h3,{id:"auth",children:"Auth"}),"\n",(0,t.jsx)(a.p,{children:"Object store credentials are required to access non-public Delta Lake tables."}),"\n",(0,t.jsxs)(a.p,{children:["Check ",(0,t.jsx)(a.a,{href:"/components/secret-stores",children:"Secrets Stores"})," for more details."]}),"\n",(0,t.jsxs)(s.A,{children:[(0,t.jsxs)(l.A,{value:"local",label:"Local",default:!0,children:[(0,t.jsx)(a.pre,{children:(0,t.jsx)(a.code,{className:"language-bash",children:"spice login delta_lake --aws-region <aws-region> --aws-access-key-id <aws-access-key-id> --aws-secret-access-key <aws-secret-access-key>\n"})}),(0,t.jsxs)(a.p,{children:["Learn more about ",(0,t.jsx)(a.a,{href:"/components/secret-stores/file",children:"File Secret Store"}),"."]})]}),(0,t.jsxs)(l.A,{value:"env",label:"Env",children:[(0,t.jsx)(a.pre,{children:(0,t.jsx)(a.code,{className:"language-bash",children:"SPICE_SECRET_DELTA_LAKE_AWS_REGION=<aws-region> \\\nSPICE_SECRET_DELTA_LAKE_AWS_ACCESS_KEY_ID=<aws-access-key-id> \\\nSPICE_SECRET_DELTA_LAKE_AWS_SECRET_ACCESS_KEY=<aws-secret\nspice run\n"})}),(0,t.jsx)(a.p,{children:(0,t.jsx)(a.code,{children:"spicepod.yaml"})}),(0,t.jsx)(a.pre,{children:(0,t.jsx)(a.code,{className:"language-yaml",children:"version: v1beta1\nkind: Spicepod\nname: spice-app\n\nsecrets:\n  store: env\n\n# <...>\n"})}),(0,t.jsxs)(a.p,{children:["Learn more about ",(0,t.jsx)(a.a,{href:"/components/secret-stores/env",children:"Env Secret Store"}),"."]})]}),(0,t.jsxs)(l.A,{value:"k8s",label:"Kubernetes",children:[(0,t.jsx)(a.pre,{children:(0,t.jsx)(a.code,{className:"language-bash",children:"kubectl create secret generic delta_lake \\\n  --from-literal=aws-region='<aws-region>'\n  --from-literal=aws-access-key-id='<aws-access-key-id>'\n  --from-literal=aws-secret-access-key='<aws-secret-access-key>'\n"})}),(0,t.jsx)(a.p,{children:(0,t.jsx)(a.code,{children:"spicepod.yaml"})}),(0,t.jsx)(a.pre,{children:(0,t.jsx)(a.code,{className:"language-yaml",children:"version: v1beta1\nkind: Spicepod\nname: spice-app\n\nsecrets:\n  store: kubernetes\n\n# <...>\n"})}),(0,t.jsxs)(a.p,{children:["Learn more about ",(0,t.jsx)(a.a,{href:"/components/secret-stores/kubernetes",children:"Kubernetes Secret Store"}),"."]})]}),(0,t.jsxs)(l.A,{value:"keyring",label:"Keyring",children:[(0,t.jsx)(a.p,{children:"Add new keychain entry (macOS), with secrets in JSON string"}),(0,t.jsx)(a.pre,{children:(0,t.jsx)(a.code,{className:"language-bash",children:'security add-generic-password -l "Delta Lake Secret" \\\n-a spiced -s spice_secret_delta_lake \\\n-w $(echo -n \'{"aws-region": "<aws-region>", "aws-access-key-id": "<aws-access-key-id>", "aws-secret-access-key": "<aws-secret-access-key>"}\')\n'})}),(0,t.jsx)(a.p,{children:(0,t.jsx)(a.code,{children:"spicepod.yaml"})}),(0,t.jsx)(a.pre,{children:(0,t.jsx)(a.code,{className:"language-yaml",children:"version: v1beta1\nkind: Spicepod\nname: spice-app\n\nsecrets:\n  store: keyring\n\n# <...>\n"})}),(0,t.jsxs)(a.p,{children:["Learn more about ",(0,t.jsx)(a.a,{href:"/components/secret-stores/keyring",children:"Keyring Secret Store"}),"."]})]})]})]})}function h(e={}){const{wrapper:a}={...(0,r.R)(),...e.components};return a?(0,t.jsx)(a,{...e,children:(0,t.jsx)(p,{...e})}):p(e)}},9365:(e,a,n)=>{n.d(a,{A:()=>l});n(6540);var t=n(4164);const r={tabItem:"tabItem_Ymn6"};var s=n(4848);function l(e){let{children:a,hidden:n,className:l}=e;return(0,s.jsx)("div",{role:"tabpanel",className:(0,t.A)(r.tabItem,l),hidden:n,children:a})}},1470:(e,a,n)=>{n.d(a,{A:()=>y});var t=n(6540),r=n(4164),s=n(3104),l=n(6347),c=n(205),o=n(7485),i=n(1682),u=n(679);function d(e){return t.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,t.isValidElement)(e)&&function(e){const{props:a}=e;return!!a&&"object"==typeof a&&"value"in a}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function p(e){const{values:a,children:n}=e;return(0,t.useMemo)((()=>{const e=a??function(e){return d(e).map((e=>{let{props:{value:a,label:n,attributes:t,default:r}}=e;return{value:a,label:n,attributes:t,default:r}}))}(n);return function(e){const a=(0,i.X)(e,((e,a)=>e.value===a.value));if(a.length>0)throw new Error(`Docusaurus error: Duplicate values "${a.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[a,n])}function h(e){let{value:a,tabValues:n}=e;return n.some((e=>e.value===a))}function m(e){let{queryString:a=!1,groupId:n}=e;const r=(0,l.W6)(),s=function(e){let{queryString:a=!1,groupId:n}=e;if("string"==typeof a)return a;if(!1===a)return null;if(!0===a&&!n)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return n??null}({queryString:a,groupId:n});return[(0,o.aZ)(s),(0,t.useCallback)((e=>{if(!s)return;const a=new URLSearchParams(r.location.search);a.set(s,e),r.replace({...r.location,search:a.toString()})}),[s,r])]}function b(e){const{defaultValue:a,queryString:n=!1,groupId:r}=e,s=p(e),[l,o]=(0,t.useState)((()=>function(e){let{defaultValue:a,tabValues:n}=e;if(0===n.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(a){if(!h({value:a,tabValues:n}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${a}" but none of its children has the corresponding value. Available values are: ${n.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return a}const t=n.find((e=>e.default))??n[0];if(!t)throw new Error("Unexpected error: 0 tabValues");return t.value}({defaultValue:a,tabValues:s}))),[i,d]=m({queryString:n,groupId:r}),[b,f]=function(e){let{groupId:a}=e;const n=function(e){return e?`docusaurus.tab.${e}`:null}(a),[r,s]=(0,u.Dv)(n);return[r,(0,t.useCallback)((e=>{n&&s.set(e)}),[n,s])]}({groupId:r}),g=(()=>{const e=i??b;return h({value:e,tabValues:s})?e:null})();(0,c.A)((()=>{g&&o(g)}),[g]);return{selectedValue:l,selectValue:(0,t.useCallback)((e=>{if(!h({value:e,tabValues:s}))throw new Error(`Can't select invalid tab value=${e}`);o(e),d(e),f(e)}),[d,f,s]),tabValues:s}}var f=n(2303);const g={tabList:"tabList__CuJ",tabItem:"tabItem_LNqP"};var k=n(4848);function x(e){let{className:a,block:n,selectedValue:t,selectValue:l,tabValues:c}=e;const o=[],{blockElementScrollPositionUntilNextRender:i}=(0,s.a_)(),u=e=>{const a=e.currentTarget,n=o.indexOf(a),r=c[n].value;r!==t&&(i(a),l(r))},d=e=>{let a=null;switch(e.key){case"Enter":u(e);break;case"ArrowRight":{const n=o.indexOf(e.currentTarget)+1;a=o[n]??o[0];break}case"ArrowLeft":{const n=o.indexOf(e.currentTarget)-1;a=o[n]??o[o.length-1];break}}a?.focus()};return(0,k.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,r.A)("tabs",{"tabs--block":n},a),children:c.map((e=>{let{value:a,label:n,attributes:s}=e;return(0,k.jsx)("li",{role:"tab",tabIndex:t===a?0:-1,"aria-selected":t===a,ref:e=>o.push(e),onKeyDown:d,onClick:u,...s,className:(0,r.A)("tabs__item",g.tabItem,s?.className,{"tabs__item--active":t===a}),children:n??a},a)}))})}function v(e){let{lazy:a,children:n,selectedValue:r}=e;const s=(Array.isArray(n)?n:[n]).filter(Boolean);if(a){const e=s.find((e=>e.props.value===r));return e?(0,t.cloneElement)(e,{className:"margin-top--md"}):null}return(0,k.jsx)("div",{className:"margin-top--md",children:s.map(((e,a)=>(0,t.cloneElement)(e,{key:a,hidden:e.props.value!==r})))})}function j(e){const a=b(e);return(0,k.jsxs)("div",{className:(0,r.A)("tabs-container",g.tabList),children:[(0,k.jsx)(x,{...a,...e}),(0,k.jsx)(v,{...a,...e})]})}function y(e){const a=(0,f.A)();return(0,k.jsx)(j,{...e,children:d(e.children)},String(a))}},8453:(e,a,n)=>{n.d(a,{R:()=>l,x:()=>c});var t=n(6540);const r={},s=t.createContext(r);function l(e){const a=t.useContext(s);return t.useMemo((function(){return"function"==typeof e?e(a):{...a,...e}}),[a,e])}function c(e){let a;return a=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:l(e.components),t.createElement(s.Provider,{value:a},e.children)}}}]);
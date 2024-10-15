"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[8532],{6514:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>d,contentTitle:()=>c,default:()=>h,frontMatter:()=>o,metadata:()=>l,toc:()=>u});var a=t(4848),r=t(8453),s=t(1470),i=t(9365);const o={title:"S3 Data Connector",sidebar_label:"S3 Data Connector",description:"S3 Data Connector Documentation"},c=void 0,l={id:"components/data-connectors/s3",title:"S3 Data Connector",description:"S3 Data Connector Documentation",source:"@site/docs/components/data-connectors/s3.md",sourceDirName:"components/data-connectors",slug:"/components/data-connectors/s3",permalink:"/components/data-connectors/s3",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/components/data-connectors/s3.md",tags:[],version:"current",frontMatter:{title:"S3 Data Connector",sidebar_label:"S3 Data Connector",description:"S3 Data Connector Documentation"},sidebar:"docsSidebar",previous:{title:"PostgreSQL Data Connector",permalink:"/components/data-connectors/postgres/"},next:{title:"SharePoint Data Connector",permalink:"/components/data-connectors/sharepoint"}},d={},u=[{value:"Dataset Schema Reference",id:"dataset-schema-reference",level:2},{value:"<code>from</code>",id:"from",level:3},{value:"<code>name</code>",id:"name",level:3},{value:"<code>params</code>",id:"params",level:3},{value:"Auth",id:"auth",level:2},{value:"Examples",id:"examples",level:2},{value:"MinIO Example",id:"minio-example",level:3},{value:"S3 Public Example",id:"s3-public-example",level:3},{value:"Hive Partitioning Example",id:"hive-partitioning-example",level:3}];function p(e){const n={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",ul:"ul",...(0,r.R)(),...e.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(n.p,{children:"The S3 Data Connector enables federated SQL query on files stored in S3 or S3-compatible systems (e.g. MinIO, Cloudflare R2)."}),"\n",(0,a.jsx)(n.p,{children:"If a folder is provided, all child files will be loaded."}),"\n",(0,a.jsxs)(n.p,{children:["File formats are specified using the ",(0,a.jsx)(n.code,{children:"file_format"})," parameter, as described in ",(0,a.jsx)(n.a,{href:"/components/data-connectors/#object-store-file-formats",children:"Object Store File Formats"}),"."]}),"\n",(0,a.jsxs)(n.p,{children:["Example ",(0,a.jsx)(n.code,{children:"spicepod.yml"}),":"]}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  # Using access keys\n  - from: s3://s3-bucket-name/path/to/parquet/cool_dataset.parquet\n    name: cool_dataset\n    params:\n      s3_auth: key\n      s3_key: ${secrets:S3_KEY}\n      s3_secret: ${secrets:S3_SECRET}\n\n  # Using AWS IAM roles\n  - from: s3://s3-bucket-name/path/to/parquet/cool_dataset2.parquet\n    name: cool_dataset2\n    params:\n      s3_auth: iam_role\n\n  # Using a public bucket\n  - from: s3://spiceai-demo-datasets/taxi_trips/2024/\n    name: taxi_trips\n    params:\n      file_format: parquet\n"})}),"\n",(0,a.jsx)(n.h2,{id:"dataset-schema-reference",children:"Dataset Schema Reference"}),"\n",(0,a.jsx)(n.h3,{id:"from",children:(0,a.jsx)(n.code,{children:"from"})}),"\n",(0,a.jsxs)(n.p,{children:["The S3-compatible URI to a folder or object in form ",(0,a.jsx)(n.code,{children:"from: s3://<bucket>/<file>"})]}),"\n",(0,a.jsxs)(n.p,{children:["Example: ",(0,a.jsx)(n.code,{children:"from: s3://s3-bucket-name/path/to/parquet/cool_dataset.parquet"})]}),"\n",(0,a.jsx)(n.h3,{id:"name",children:(0,a.jsx)(n.code,{children:"name"})}),"\n",(0,a.jsx)(n.p,{children:"The dataset name."}),"\n",(0,a.jsxs)(n.p,{children:["Example: ",(0,a.jsx)(n.code,{children:"name: cool_dataset"})]}),"\n",(0,a.jsx)(n.h3,{id:"params",children:(0,a.jsx)(n.code,{children:"params"})}),"\n",(0,a.jsxs)(n.ul,{children:["\n",(0,a.jsxs)(n.li,{children:[(0,a.jsx)(n.code,{children:"file_format"}),": Specifies the data file format. Required if the format cannot be inferred by from the ",(0,a.jsx)(n.code,{children:"from"})," path.","\n",(0,a.jsxs)(n.ul,{children:["\n",(0,a.jsxs)(n.li,{children:[(0,a.jsx)(n.code,{children:"parquet"}),": Parquet file format."]}),"\n",(0,a.jsxs)(n.li,{children:[(0,a.jsx)(n.code,{children:"csv"}),": CSV file format."]}),"\n"]}),"\n"]}),"\n",(0,a.jsxs)(n.li,{children:[(0,a.jsx)(n.code,{children:"s3_endpoint"}),": The S3 endpoint, or equivalent (e.g. MinIO endpoint), for the S3-compatible storage. Defaults to region endpoint. E.g. ",(0,a.jsx)(n.code,{children:"s3_endpoint: https://my.minio.server"})]}),"\n",(0,a.jsxs)(n.li,{children:[(0,a.jsx)(n.code,{children:"s3_region"}),": Region of the S3 bucket, if region specific. Default value is ",(0,a.jsx)(n.code,{children:"us-east-1"})," E.g. ",(0,a.jsx)(n.code,{children:"s3_region: us-east-1"})]}),"\n",(0,a.jsxs)(n.li,{children:[(0,a.jsx)(n.code,{children:"client_timeout"}),": Specifies timeout for S3 operations. Default value is ",(0,a.jsx)(n.code,{children:"30s"})," E.g. ",(0,a.jsx)(n.code,{children:"client_timeout: 60s"})]}),"\n",(0,a.jsxs)(n.li,{children:[(0,a.jsx)(n.code,{children:"hive_infer_partitions"}),": Infer the partition columns for hive-style partitioning from the folder structure. Defaults to true."]}),"\n"]}),"\n",(0,a.jsxs)(n.p,{children:["More CSV related parameters can be configured, see ",(0,a.jsx)(n.a,{href:"/reference/file_format#csv",children:"CSV Parameters"})]}),"\n",(0,a.jsx)(n.h2,{id:"auth",children:"Auth"}),"\n",(0,a.jsxs)(n.p,{children:["Optional for public endpoints. Use the ",(0,a.jsx)(n.a,{href:"/components/secret-stores/",children:"secret replacement syntax"})," to load the password from a secret store, e.g. ",(0,a.jsx)(n.code,{children:"${secrets:my_dremio_pass}"}),"."]}),"\n",(0,a.jsxs)(n.ul,{children:["\n",(0,a.jsxs)(n.li,{children:[(0,a.jsx)(n.code,{children:"s3_auth"}),": (Optional) The authentication method to use. Values are ",(0,a.jsx)(n.code,{children:"public"}),", ",(0,a.jsx)(n.code,{children:"key"})," and ",(0,a.jsx)(n.code,{children:"iam_role"}),". Defaults to ",(0,a.jsx)(n.code,{children:"public"})," if ",(0,a.jsx)(n.code,{children:"s3_key"})," and ",(0,a.jsx)(n.code,{children:"s3_secret"})," are not provided, otherwise defaults to ",(0,a.jsx)(n.code,{children:"key"}),"."]}),"\n",(0,a.jsxs)(n.li,{children:[(0,a.jsx)(n.code,{children:"s3_key"}),": The access key (e.g. ",(0,a.jsx)(n.code,{children:"AWS_ACCESS_KEY_ID"})," for AWS)"]}),"\n",(0,a.jsxs)(n.li,{children:[(0,a.jsx)(n.code,{children:"s3_secret"}),": The secret key (e.g. ",(0,a.jsx)(n.code,{children:"AWS_SECRET_ACCESS_KEY"})," for AWS)"]}),"\n"]}),"\n",(0,a.jsxs)(n.p,{children:["For non-public buckets, ",(0,a.jsx)(n.code,{children:"s3_auth: key"})," or ",(0,a.jsx)(n.code,{children:"s3_auth: iam_role"})," is required. ",(0,a.jsx)(n.code,{children:"s3_auth: iam_role"})," will use the ",(0,a.jsx)(n.a,{href:"https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/iam-roles-for-amazon-ec2.html",children:"AWS IAM role"})," of the currently running instance."]}),"\n",(0,a.jsxs)(s.A,{children:[(0,a.jsxs)(i.A,{value:"env",label:"Env",children:[(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-bash",children:"SPICE_S3_KEY=AKIAIOSFODNN7EXAMPLE \\\nSPICE_S3_SECRET=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY \\\nspice run\n# Or using the CLI to configure the secrets into an `.env` file\nspice login s3 -k AKIAIOSFODNN7EXAMPLE -s wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\n"})}),(0,a.jsx)(n.p,{children:(0,a.jsx)(n.code,{children:".env"})}),(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-bash",children:"SPICE_S3_KEY=AKIAIOSFODNN7EXAMPLE\nSPICE_S3_SECRET=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\n"})}),(0,a.jsx)(n.p,{children:(0,a.jsx)(n.code,{children:"spicepod.yaml"})}),(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-yaml",children:"version: v1beta1\nkind: Spicepod\nname: spice-app\n\nsecrets:\n  - from: env\n    name: env\n\ndatasets:\n  - from: s3://s3-bucket-name/path/to/parquet/cool_dataset.parquet\n    name: cool_dataset\n    params:\n      s3_region: us-east-1\n      s3_key: ${env:SPICE_S3_KEY}\n      s3_secret: ${env:SPICE_S3_SECRET}\n"})}),(0,a.jsxs)(n.p,{children:["Learn more about ",(0,a.jsx)(n.a,{href:"/components/secret-stores/env",children:"Env Secret Store"}),"."]})]}),(0,a.jsxs)(i.A,{value:"k8s",label:"Kubernetes",children:[(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-bash",children:"kubectl create secret generic s3 \\\n  --from-literal=key='AKIAIOSFODNN7EXAMPLE' \\\n  --from-literal=secret='wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'\n"})}),(0,a.jsx)(n.p,{children:(0,a.jsx)(n.code,{children:"spicepod.yaml"})}),(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-yaml",children:"version: v1beta1\nkind: Spicepod\nname: spice-app\n\nsecrets:\n  - from: kubernetes:s3\n    name: s3\n\ndatasets:\n  - from: s3://s3-bucket-name/path/to/parquet/cool_dataset.parquet\n    name: cool_dataset\n    params:\n      s3_region: us-east-1\n      s3_key: ${s3:key}\n      s3_secret: ${s3:secret}\n"})}),(0,a.jsxs)(n.p,{children:["Learn more about ",(0,a.jsx)(n.a,{href:"/components/secret-stores/kubernetes",children:"Kubernetes Secret Store"}),"."]})]}),(0,a.jsxs)(i.A,{value:"keyring",label:"Keyring",children:[(0,a.jsx)(n.p,{children:"Add new keychain entries (macOS) for the key and secret:"}),(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-bash",children:'# Add Key to keychain\nsecurity add-generic-secret -l "S3 Key" \\\n-a spiced -s spice_s3_key \\\n-w AKIAIOSFODNN7EXAMPLE\n# Add Secret to keychain\nsecurity add-generic-secret -l "S3 Secret" \\\n-a spiced -s spice_s3_secret \\\n-w wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\n'})}),(0,a.jsx)(n.p,{children:(0,a.jsx)(n.code,{children:"spicepod.yaml"})}),(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-yaml",children:"version: v1beta1\nkind: Spicepod\nname: spice-app\n\nsecrets:\n  - from: keyring\n    name: keyring\n\ndatasets:\n  - from: s3://s3-bucket-name/path/to/parquet/cool_dataset.parquet\n    name: cool_dataset\n    params:\n      s3_region: us-east-1\n      s3_key: ${keyring:spice_s3_key}\n      s3_secret: ${keyring:spice_s3_secret}\n"})}),(0,a.jsxs)(n.p,{children:["Learn more about ",(0,a.jsx)(n.a,{href:"/components/secret-stores/keyring",children:"Keyring Secret Store"}),"."]})]})]}),"\n",(0,a.jsx)(n.h2,{id:"examples",children:"Examples"}),"\n",(0,a.jsx)(n.h3,{id:"minio-example",children:"MinIO Example"}),"\n",(0,a.jsxs)(n.p,{children:["Create a dataset named ",(0,a.jsx)(n.code,{children:"cool_dataset"})," from a Parquet file stored in MinIO."]}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-yaml",children:"- from: s3://s3-bucket-name/path/to/parquet/cool_dataset.parquet\n  name: cool_dataset\n  params:\n    s3_endpoint: https://my.minio.server\n    s3_region: 'us-east-1' # Best practice for Minio\n"})}),"\n",(0,a.jsx)(n.h3,{id:"s3-public-example",children:"S3 Public Example"}),"\n",(0,a.jsxs)(n.p,{children:["Create a dataset named ",(0,a.jsx)(n.code,{children:"taxi_trips"})," from a public S3 folder."]}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-yaml",children:"- from: s3://spiceai-demo-datasets/taxi_trips/2024/\n  name: taxi_trips\n  params:\n    file_format: parquet\n"})}),"\n",(0,a.jsx)(n.h3,{id:"hive-partitioning-example",children:"Hive Partitioning Example"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-yaml",children:"version: v1beta1\nkind: Spicepod\nname: hive_data\n\ndatasets:\n  - from: s3://spiceai-public-datasets/hive_partitioned_data/\n    name: hive_data_infer\n    params:\n      file_format: parquet\n      hive_infer_partitions: true\n"})})]})}function h(e={}){const{wrapper:n}={...(0,r.R)(),...e.components};return n?(0,a.jsx)(n,{...e,children:(0,a.jsx)(p,{...e})}):p(e)}},9365:(e,n,t)=>{t.d(n,{A:()=>i});t(6540);var a=t(4164);const r={tabItem:"tabItem_Ymn6"};var s=t(4848);function i(e){let{children:n,hidden:t,className:i}=e;return(0,s.jsx)("div",{role:"tabpanel",className:(0,a.A)(r.tabItem,i),hidden:t,children:n})}},1470:(e,n,t)=>{t.d(n,{A:()=>S});var a=t(6540),r=t(4164),s=t(3104),i=t(6347),o=t(205),c=t(7485),l=t(1682),d=t(679);function u(e){return a.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,a.isValidElement)(e)&&function(e){const{props:n}=e;return!!n&&"object"==typeof n&&"value"in n}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function p(e){const{values:n,children:t}=e;return(0,a.useMemo)((()=>{const e=n??function(e){return u(e).map((e=>{let{props:{value:n,label:t,attributes:a,default:r}}=e;return{value:n,label:t,attributes:a,default:r}}))}(t);return function(e){const n=(0,l.XI)(e,((e,n)=>e.value===n.value));if(n.length>0)throw new Error(`Docusaurus error: Duplicate values "${n.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[n,t])}function h(e){let{value:n,tabValues:t}=e;return t.some((e=>e.value===n))}function m(e){let{queryString:n=!1,groupId:t}=e;const r=(0,i.W6)(),s=function(e){let{queryString:n=!1,groupId:t}=e;if("string"==typeof n)return n;if(!1===n)return null;if(!0===n&&!t)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return t??null}({queryString:n,groupId:t});return[(0,c.aZ)(s),(0,a.useCallback)((e=>{if(!s)return;const n=new URLSearchParams(r.location.search);n.set(s,e),r.replace({...r.location,search:n.toString()})}),[s,r])]}function f(e){const{defaultValue:n,queryString:t=!1,groupId:r}=e,s=p(e),[i,c]=(0,a.useState)((()=>function(e){let{defaultValue:n,tabValues:t}=e;if(0===t.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(n){if(!h({value:n,tabValues:t}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${n}" but none of its children has the corresponding value. Available values are: ${t.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return n}const a=t.find((e=>e.default))??t[0];if(!a)throw new Error("Unexpected error: 0 tabValues");return a.value}({defaultValue:n,tabValues:s}))),[l,u]=m({queryString:t,groupId:r}),[f,x]=function(e){let{groupId:n}=e;const t=function(e){return e?`docusaurus.tab.${e}`:null}(n),[r,s]=(0,d.Dv)(t);return[r,(0,a.useCallback)((e=>{t&&s.set(e)}),[t,s])]}({groupId:r}),j=(()=>{const e=l??f;return h({value:e,tabValues:s})?e:null})();(0,o.A)((()=>{j&&c(j)}),[j]);return{selectedValue:i,selectValue:(0,a.useCallback)((e=>{if(!h({value:e,tabValues:s}))throw new Error(`Can't select invalid tab value=${e}`);c(e),u(e),x(e)}),[u,x,s]),tabValues:s}}var x=t(2303);const j={tabList:"tabList__CuJ",tabItem:"tabItem_LNqP"};var b=t(4848);function _(e){let{className:n,block:t,selectedValue:a,selectValue:i,tabValues:o}=e;const c=[],{blockElementScrollPositionUntilNextRender:l}=(0,s.a_)(),d=e=>{const n=e.currentTarget,t=c.indexOf(n),r=o[t].value;r!==a&&(l(n),i(r))},u=e=>{let n=null;switch(e.key){case"Enter":d(e);break;case"ArrowRight":{const t=c.indexOf(e.currentTarget)+1;n=c[t]??c[0];break}case"ArrowLeft":{const t=c.indexOf(e.currentTarget)-1;n=c[t]??c[c.length-1];break}}n?.focus()};return(0,b.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,r.A)("tabs",{"tabs--block":t},n),children:o.map((e=>{let{value:n,label:t,attributes:s}=e;return(0,b.jsx)("li",{role:"tab",tabIndex:a===n?0:-1,"aria-selected":a===n,ref:e=>c.push(e),onKeyDown:u,onClick:d,...s,className:(0,r.A)("tabs__item",j.tabItem,s?.className,{"tabs__item--active":a===n}),children:t??n},n)}))})}function v(e){let{lazy:n,children:t,selectedValue:s}=e;const i=(Array.isArray(t)?t:[t]).filter(Boolean);if(n){const e=i.find((e=>e.props.value===s));return e?(0,a.cloneElement)(e,{className:(0,r.A)("margin-top--md",e.props.className)}):null}return(0,b.jsx)("div",{className:"margin-top--md",children:i.map(((e,n)=>(0,a.cloneElement)(e,{key:n,hidden:e.props.value!==s})))})}function g(e){const n=f(e);return(0,b.jsxs)("div",{className:(0,r.A)("tabs-container",j.tabList),children:[(0,b.jsx)(_,{...n,...e}),(0,b.jsx)(v,{...n,...e})]})}function S(e){const n=(0,x.A)();return(0,b.jsx)(g,{...e,children:u(e.children)},String(n))}},8453:(e,n,t)=>{t.d(n,{R:()=>i,x:()=>o});var a=t(6540);const r={},s=a.createContext(r);function i(e){const n=a.useContext(s);return a.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:i(e.components),a.createElement(s.Provider,{value:n},e.children)}}}]);
"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[1493],{7886:(e,a,n)=>{n.r(a),n.d(a,{assets:()=>d,contentTitle:()=>o,default:()=>p,frontMatter:()=>i,metadata:()=>l,toc:()=>u});var r=n(4848),t=n(8453),s=n(1470),c=n(9365);const i={title:"Databricks Data Connector",sidebar_label:"Databricks Data Connector",description:"Databricks Data Connector Documentation"},o=void 0,l={id:"data-connectors/databricks",title:"Databricks Data Connector",description:"Databricks Data Connector Documentation",source:"@site/docs/data-connectors/databricks.md",sourceDirName:"data-connectors",slug:"/data-connectors/databricks",permalink:"/data-connectors/databricks",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/data-connectors/databricks.md",tags:[],version:"current",frontMatter:{title:"Databricks Data Connector",sidebar_label:"Databricks Data Connector",description:"Databricks Data Connector Documentation"},sidebar:"tutorialSidebar",previous:{title:"Data Connectors",permalink:"/data-connectors/"},next:{title:"Dremio Data Connector",permalink:"/data-connectors/dremio"}},d={},u=[{value:"Configuration",id:"configuration",level:2},{value:"Parameters",id:"parameters",level:3},{value:"Auth",id:"auth",level:3},{value:"Example",id:"example",level:2}];function h(e){const a={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",ul:"ul",...(0,t.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)(a.p,{children:["Databricks as a connector for federated SQL query against Databrick's ",(0,r.jsx)(a.a,{href:"https://docs.databricks.com/en/delta/index.html",children:"Delta Lake"}),"."]}),"\n",(0,r.jsx)(a.h2,{id:"configuration",children:"Configuration"}),"\n",(0,r.jsxs)(a.p,{children:[(0,r.jsx)(a.code,{children:"spice login databricks"})," can be used to configure secrets for the Spice runtime (including AWS object store keys)."]}),"\n",(0,r.jsx)(a.h3,{id:"parameters",children:"Parameters"}),"\n",(0,r.jsxs)(a.ul,{children:["\n",(0,r.jsxs)(a.li,{children:[(0,r.jsx)(a.code,{children:"endpoint"}),": The HTTPS endpoint of the Databricks host storing the desired tables."]}),"\n"]}),"\n",(0,r.jsx)(a.h3,{id:"auth",children:"Auth"}),"\n",(0,r.jsxs)(a.p,{children:["An active personal access token for the Databricks instance is required (equivalent to ",(0,r.jsx)(a.code,{children:"DATABRICKS_TOKEN"}),").\nOther keys provided in the secret are directly passed to the underlying secret store (e.g. ",(0,r.jsx)(a.code,{children:"AWS_ACCESS_KEY_ID"})," and ",(0,r.jsx)(a.code,{children:"AWS_SECRET_ACCESS_KEY"})," if backed by AWS S3)."]}),"\n",(0,r.jsxs)(a.p,{children:["By default Databricks connector will look for a secret named ",(0,r.jsx)(a.code,{children:"databricks"})," with keys ",(0,r.jsx)(a.code,{children:"token"})," and ",(0,r.jsx)(a.code,{children:"AWS_DEFAULT_REGION"}),",\n",(0,r.jsx)(a.code,{children:"AWS_ACCESS_KEY_ID"})," and ",(0,r.jsx)(a.code,{children:"AWS_SECRET_ACCESS_KEY"}),"."]}),"\n",(0,r.jsxs)(a.p,{children:["Check ",(0,r.jsx)(a.a,{href:"/secret-stores",children:"Secrets Stores"})," for more details."]}),"\n",(0,r.jsxs)(s.A,{children:[(0,r.jsxs)(c.A,{value:"local",label:"Local",default:!0,children:[(0,r.jsx)(a.pre,{children:(0,r.jsx)(a.code,{className:"language-bash",children:"spice login databricks --token <access-token> --aws-region <aws-region> --aws-access-key-id <aws-access-key-id> --aws-secret-access-key <aws-secret-access-key>\n"})}),(0,r.jsxs)(a.p,{children:["Learn more about ",(0,r.jsx)(a.a,{href:"/secret-stores/file",children:"File Secret Store"}),"."]})]}),(0,r.jsxs)(c.A,{value:"env",label:"Env",children:[(0,r.jsx)(a.pre,{children:(0,r.jsx)(a.code,{className:"language-bash",children:"SPICE_SECRET_DATABRICKS_TOKEN=<access-token> \\\nSPICE_SECRET_DATABRICKS_AWS_DEFAULT_REGION=<aws-region> \\\nSPICE_SECRET_DATABRICKS_AWS_ACCESS_KEY_ID=<aws-access-key-id> \\\nSPICE_SECRET_DATABRICKS_AWS_SECRET_ACCESS_KEY=<aws-secret-access-key> \\\nspice run\n"})}),(0,r.jsx)(a.p,{children:(0,r.jsx)(a.code,{children:"spicepod.yaml"})}),(0,r.jsx)(a.pre,{children:(0,r.jsx)(a.code,{className:"language-yaml",children:"version: v1beta1\nkind: Spicepod\nname: spice-app\n\nsecrets:\n  store: env\n\n# <...>\n"})}),(0,r.jsxs)(a.p,{children:["Learn more about ",(0,r.jsx)(a.a,{href:"/secret-stores/env",children:"Env Secret Store"}),"."]})]}),(0,r.jsxs)(c.A,{value:"k8s",label:"Kubernetes",children:[(0,r.jsx)(a.pre,{children:(0,r.jsx)(a.code,{className:"language-bash",children:"kubectl create secret generic databricks \\\n  --from-literal=token='<access-token>' \\\n  --from-literal=AWS_DEFAULT_REGION='<aws-region>' \\\n  --from-literal=AWS_ACCESS_KEY_ID='<aws-access-key-id>' \\\n  --from-literal=AWS_SECRET_ACCESS_KEY='<aws-secret-access-key>'\n"})}),(0,r.jsx)(a.p,{children:(0,r.jsx)(a.code,{children:"spicepod.yaml"})}),(0,r.jsx)(a.pre,{children:(0,r.jsx)(a.code,{className:"language-yaml",children:"version: v1beta1\nkind: Spicepod\nname: spice-app\n\nsecrets:\n  store: kubernetes\n\n# <...>\n"})}),(0,r.jsxs)(a.p,{children:["Learn more about ",(0,r.jsx)(a.a,{href:"/secret-stores/kubernetes",children:"Kubernetes Secret Store"}),"."]})]}),(0,r.jsxs)(c.A,{value:"keyring",label:"Keyring",children:[(0,r.jsx)(a.p,{children:"Add new keychain entry (macOS), with user and password in JSON string"}),(0,r.jsx)(a.pre,{children:(0,r.jsx)(a.code,{className:"language-bash",children:'security add-generic-password -l "Databricks Secret" \\\n-a spiced -s spice_secret_databricks \\\n-w $(echo -n \'{"token": "<access-token>", "AWS_DEFAULT_REGION": "<aws-region>", "AWS_ACCESS_KEY_ID": "<aws-access-key-id>", "AWS_SECRET_ACCESS_KEY": "<aws-secret-access-key>"}\')\n'})}),(0,r.jsx)(a.p,{children:(0,r.jsx)(a.code,{children:"spicepod.yaml"})}),(0,r.jsx)(a.pre,{children:(0,r.jsx)(a.code,{className:"language-yaml",children:"version: v1beta1\nkind: Spicepod\nname: spice-app\n\nsecrets:\n  store: keyring\n\n# <...>\n"})}),(0,r.jsxs)(a.p,{children:["Learn more about ",(0,r.jsx)(a.a,{href:"/secret-stores/keyring",children:"Keyring Secret Store"}),"."]})]})]}),"\n",(0,r.jsx)(a.h2,{id:"example",children:"Example"}),"\n",(0,r.jsx)(a.pre,{children:(0,r.jsx)(a.code,{className:"language-yaml",children:'datasets:\n  - from: databricks:spiceai.datasets.my_awesome_table  // A reference to a table in the Databricks unity catalog\n    name: my_delta_lake_table\n  params:\n    endpoint: "https://dbc-a1b2345c-d6e7.cloud.databricks.com"\n'})})]})}function p(e={}){const{wrapper:a}={...(0,t.R)(),...e.components};return a?(0,r.jsx)(a,{...e,children:(0,r.jsx)(h,{...e})}):h(e)}},9365:(e,a,n)=>{n.d(a,{A:()=>c});n(6540);var r=n(4164);const t={tabItem:"tabItem_Ymn6"};var s=n(4848);function c(e){let{children:a,hidden:n,className:c}=e;return(0,s.jsx)("div",{role:"tabpanel",className:(0,r.A)(t.tabItem,c),hidden:n,children:a})}},1470:(e,a,n)=>{n.d(a,{A:()=>j});var r=n(6540),t=n(4164),s=n(3104),c=n(6347),i=n(205),o=n(7485),l=n(1682),d=n(9466);function u(e){return r.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,r.isValidElement)(e)&&function(e){const{props:a}=e;return!!a&&"object"==typeof a&&"value"in a}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function h(e){const{values:a,children:n}=e;return(0,r.useMemo)((()=>{const e=a??function(e){return u(e).map((e=>{let{props:{value:a,label:n,attributes:r,default:t}}=e;return{value:a,label:n,attributes:r,default:t}}))}(n);return function(e){const a=(0,l.X)(e,((e,a)=>e.value===a.value));if(a.length>0)throw new Error(`Docusaurus error: Duplicate values "${a.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[a,n])}function p(e){let{value:a,tabValues:n}=e;return n.some((e=>e.value===a))}function b(e){let{queryString:a=!1,groupId:n}=e;const t=(0,c.W6)(),s=function(e){let{queryString:a=!1,groupId:n}=e;if("string"==typeof a)return a;if(!1===a)return null;if(!0===a&&!n)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return n??null}({queryString:a,groupId:n});return[(0,o.aZ)(s),(0,r.useCallback)((e=>{if(!s)return;const a=new URLSearchParams(t.location.search);a.set(s,e),t.replace({...t.location,search:a.toString()})}),[s,t])]}function m(e){const{defaultValue:a,queryString:n=!1,groupId:t}=e,s=h(e),[c,o]=(0,r.useState)((()=>function(e){let{defaultValue:a,tabValues:n}=e;if(0===n.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(a){if(!p({value:a,tabValues:n}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${a}" but none of its children has the corresponding value. Available values are: ${n.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return a}const r=n.find((e=>e.default))??n[0];if(!r)throw new Error("Unexpected error: 0 tabValues");return r.value}({defaultValue:a,tabValues:s}))),[l,u]=b({queryString:n,groupId:t}),[m,f]=function(e){let{groupId:a}=e;const n=function(e){return e?`docusaurus.tab.${e}`:null}(a),[t,s]=(0,d.Dv)(n);return[t,(0,r.useCallback)((e=>{n&&s.set(e)}),[n,s])]}({groupId:t}),x=(()=>{const e=l??m;return p({value:e,tabValues:s})?e:null})();(0,i.A)((()=>{x&&o(x)}),[x]);return{selectedValue:c,selectValue:(0,r.useCallback)((e=>{if(!p({value:e,tabValues:s}))throw new Error(`Can't select invalid tab value=${e}`);o(e),u(e),f(e)}),[u,f,s]),tabValues:s}}var f=n(2303);const x={tabList:"tabList__CuJ",tabItem:"tabItem_LNqP"};var S=n(4848);function k(e){let{className:a,block:n,selectedValue:r,selectValue:c,tabValues:i}=e;const o=[],{blockElementScrollPositionUntilNextRender:l}=(0,s.a_)(),d=e=>{const a=e.currentTarget,n=o.indexOf(a),t=i[n].value;t!==r&&(l(a),c(t))},u=e=>{let a=null;switch(e.key){case"Enter":d(e);break;case"ArrowRight":{const n=o.indexOf(e.currentTarget)+1;a=o[n]??o[0];break}case"ArrowLeft":{const n=o.indexOf(e.currentTarget)-1;a=o[n]??o[o.length-1];break}}a?.focus()};return(0,S.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,t.A)("tabs",{"tabs--block":n},a),children:i.map((e=>{let{value:a,label:n,attributes:s}=e;return(0,S.jsx)("li",{role:"tab",tabIndex:r===a?0:-1,"aria-selected":r===a,ref:e=>o.push(e),onKeyDown:u,onClick:d,...s,className:(0,t.A)("tabs__item",x.tabItem,s?.className,{"tabs__item--active":r===a}),children:n??a},a)}))})}function g(e){let{lazy:a,children:n,selectedValue:t}=e;const s=(Array.isArray(n)?n:[n]).filter(Boolean);if(a){const e=s.find((e=>e.props.value===t));return e?(0,r.cloneElement)(e,{className:"margin-top--md"}):null}return(0,S.jsx)("div",{className:"margin-top--md",children:s.map(((e,a)=>(0,r.cloneElement)(e,{key:a,hidden:e.props.value!==t})))})}function v(e){const a=m(e);return(0,S.jsxs)("div",{className:(0,t.A)("tabs-container",x.tabList),children:[(0,S.jsx)(k,{...e,...a}),(0,S.jsx)(g,{...e,...a})]})}function j(e){const a=(0,f.A)();return(0,S.jsx)(v,{...e,children:u(e.children)},String(a))}},8453:(e,a,n)=>{n.d(a,{R:()=>c,x:()=>i});var r=n(6540);const t={},s=r.createContext(t);function c(e){const a=r.useContext(s);return r.useMemo((function(){return"function"==typeof e?e(a):{...a,...e}}),[a,e])}function i(e){let a;return a=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:c(e.components),r.createElement(s.Provider,{value:a},e.children)}}}]);
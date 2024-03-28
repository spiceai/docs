"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[9349],{1368:(e,r,n)=>{n.r(r),n.d(r,{assets:()=>d,contentTitle:()=>c,default:()=>h,frontMatter:()=>l,metadata:()=>i,toc:()=>u});var t=n(4848),a=n(8453),s=n(1470),o=n(9365);const l={title:"Dremio Data Connector",sidebar_label:"Dremio Data Connector",description:"Dremio Data Connector Documentation"},c=void 0,i={id:"data-connectors/dremio",title:"Dremio Data Connector",description:"Dremio Data Connector Documentation",source:"@site/docs/data-connectors/dremio.md",sourceDirName:"data-connectors",slug:"/data-connectors/dremio",permalink:"/data-connectors/dremio",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/data-connectors/dremio.md",tags:[],version:"current",frontMatter:{title:"Dremio Data Connector",sidebar_label:"Dremio Data Connector",description:"Dremio Data Connector Documentation"},sidebar:"docsSidebar",previous:{title:"Databricks Data Connector",permalink:"/data-connectors/databricks"},next:{title:"FlightSql Data Connector",permalink:"/data-connectors/flightsql"}},d={},u=[{value:"<code>params</code>",id:"params",level:2},{value:"Auth",id:"auth",level:2},{value:"Example",id:"example",level:2}];function m(e){const r={a:"a",code:"code",h2:"h2",li:"li",p:"p",pre:"pre",ul:"ul",...(0,a.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.a,{href:"https://www.dremio.com/",children:"Dremio"})," server as a connector for federated SQL queries."]}),"\n",(0,t.jsxs)(r.p,{children:["By default Dremio connector will look for a secret named ",(0,t.jsx)(r.code,{children:"dremio"})," with"]}),"\n",(0,t.jsx)(r.h2,{id:"params",children:(0,t.jsx)(r.code,{children:"params"})}),"\n",(0,t.jsxs)(r.ul,{children:["\n",(0,t.jsxs)(r.li,{children:[(0,t.jsx)(r.code,{children:"endpoint"}),": The endpoint used to connect to the Dremio server."]}),"\n"]}),"\n",(0,t.jsx)(r.h2,{id:"auth",children:"Auth"}),"\n",(0,t.jsxs)(r.p,{children:["Username and password credentials are required to log into the Dremio Server.\nBy default Dremio connector will look for a secret named ",(0,t.jsx)(r.code,{children:"dremio"})," with keys ",(0,t.jsx)(r.code,{children:"username"})," and ",(0,t.jsx)(r.code,{children:"password"}),"."]}),"\n",(0,t.jsxs)(r.p,{children:["Check ",(0,t.jsx)(r.a,{href:"/secret-stores",children:"Secrets Stores"})," for more details."]}),"\n",(0,t.jsxs)(s.A,{children:[(0,t.jsxs)(o.A,{value:"local",label:"Local",default:!0,children:[(0,t.jsx)(r.pre,{children:(0,t.jsx)(r.code,{className:"language-bash",children:"spice login dremio -u demo -p demo1234\n"})}),(0,t.jsxs)(r.p,{children:["Learn more about ",(0,t.jsx)(r.a,{href:"/secret-stores/file",children:"File Secret Store"}),"."]})]}),(0,t.jsxs)(o.A,{value:"env",label:"Env",children:[(0,t.jsx)(r.pre,{children:(0,t.jsx)(r.code,{className:"language-bash",children:"SPICE_SECRET_DREMIO_USERNAME=demo \\\nSPICE_SECRET_DREMIO_PASSWORD=demo1234 \\\nspice run\n"})}),(0,t.jsx)(r.p,{children:(0,t.jsx)(r.code,{children:"spicepod.yaml"})}),(0,t.jsx)(r.pre,{children:(0,t.jsx)(r.code,{className:"language-yaml",children:"version: v1beta1\nkind: Spicepod\nname: spice-app\n\nsecrets:\n  store: env\n\n# <...>\n"})}),(0,t.jsxs)(r.p,{children:["Learn more about ",(0,t.jsx)(r.a,{href:"/secret-stores/env",children:"Env Secret Store"}),"."]})]}),(0,t.jsxs)(o.A,{value:"k8s",label:"Kubernetes",children:[(0,t.jsx)(r.pre,{children:(0,t.jsx)(r.code,{className:"language-bash",children:"kubectl create secret generic dremio \\\n  --from-literal=username='demo' \\\n  --from-literal=password='demo1234'\n"})}),(0,t.jsx)(r.p,{children:(0,t.jsx)(r.code,{children:"spicepod.yaml"})}),(0,t.jsx)(r.pre,{children:(0,t.jsx)(r.code,{className:"language-yaml",children:"version: v1beta1\nkind: Spicepod\nname: spice-app\n\nsecrets:\n  store: kubernetes\n\n# <...>\n"})}),(0,t.jsxs)(r.p,{children:["Learn more about ",(0,t.jsx)(r.a,{href:"/secret-stores/kubernetes",children:"Kubernetes Secret Store"}),"."]})]}),(0,t.jsxs)(o.A,{value:"keyring",label:"Keyring",children:[(0,t.jsx)(r.p,{children:"Add new keychain entry (macOS), with user and password in JSON string"}),(0,t.jsx)(r.pre,{children:(0,t.jsx)(r.code,{className:"language-bash",children:'security add-generic-password -l "Dremio Secret" \\\n-a spiced -s spice_secret_dremio \\\n-w $(echo -n \'{"username": "demo", "password": "demo1234"}\')\n'})}),(0,t.jsx)(r.p,{children:(0,t.jsx)(r.code,{children:"spicepod.yaml"})}),(0,t.jsx)(r.pre,{children:(0,t.jsx)(r.code,{className:"language-yaml",children:"version: v1beta1\nkind: Spicepod\nname: spice-app\n\nsecrets:\n  store: keyring\n\n# <...>\n"})}),(0,t.jsxs)(r.p,{children:["Learn more about ",(0,t.jsx)(r.a,{href:"/secret-stores/keyring",children:"Keyring Secret Store"}),"."]})]})]}),"\n",(0,t.jsx)(r.h2,{id:"example",children:"Example"}),"\n",(0,t.jsx)(r.pre,{children:(0,t.jsx)(r.code,{className:"language-yaml",children:"- from: dremio:datasets.dremio_dataset\n  name: dremio_dataset\n  params:\n    endpoint: grpc://127.0.0.1:32010\n"})})]})}function h(e={}){const{wrapper:r}={...(0,a.R)(),...e.components};return r?(0,t.jsx)(r,{...e,children:(0,t.jsx)(m,{...e})}):m(e)}},9365:(e,r,n)=>{n.d(r,{A:()=>o});n(6540);var t=n(4164);const a={tabItem:"tabItem_Ymn6"};var s=n(4848);function o(e){let{children:r,hidden:n,className:o}=e;return(0,s.jsx)("div",{role:"tabpanel",className:(0,t.A)(a.tabItem,o),hidden:n,children:r})}},1470:(e,r,n)=>{n.d(r,{A:()=>D});var t=n(6540),a=n(4164),s=n(3104),o=n(6347),l=n(205),c=n(7485),i=n(1682),d=n(9466);function u(e){return t.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,t.isValidElement)(e)&&function(e){const{props:r}=e;return!!r&&"object"==typeof r&&"value"in r}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function m(e){const{values:r,children:n}=e;return(0,t.useMemo)((()=>{const e=r??function(e){return u(e).map((e=>{let{props:{value:r,label:n,attributes:t,default:a}}=e;return{value:r,label:n,attributes:t,default:a}}))}(n);return function(e){const r=(0,i.X)(e,((e,r)=>e.value===r.value));if(r.length>0)throw new Error(`Docusaurus error: Duplicate values "${r.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[r,n])}function h(e){let{value:r,tabValues:n}=e;return n.some((e=>e.value===r))}function p(e){let{queryString:r=!1,groupId:n}=e;const a=(0,o.W6)(),s=function(e){let{queryString:r=!1,groupId:n}=e;if("string"==typeof r)return r;if(!1===r)return null;if(!0===r&&!n)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return n??null}({queryString:r,groupId:n});return[(0,c.aZ)(s),(0,t.useCallback)((e=>{if(!s)return;const r=new URLSearchParams(a.location.search);r.set(s,e),a.replace({...a.location,search:r.toString()})}),[s,a])]}function b(e){const{defaultValue:r,queryString:n=!1,groupId:a}=e,s=m(e),[o,c]=(0,t.useState)((()=>function(e){let{defaultValue:r,tabValues:n}=e;if(0===n.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(r){if(!h({value:r,tabValues:n}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${r}" but none of its children has the corresponding value. Available values are: ${n.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return r}const t=n.find((e=>e.default))??n[0];if(!t)throw new Error("Unexpected error: 0 tabValues");return t.value}({defaultValue:r,tabValues:s}))),[i,u]=p({queryString:n,groupId:a}),[b,f]=function(e){let{groupId:r}=e;const n=function(e){return e?`docusaurus.tab.${e}`:null}(r),[a,s]=(0,d.Dv)(n);return[a,(0,t.useCallback)((e=>{n&&s.set(e)}),[n,s])]}({groupId:a}),x=(()=>{const e=i??b;return h({value:e,tabValues:s})?e:null})();(0,l.A)((()=>{x&&c(x)}),[x]);return{selectedValue:o,selectValue:(0,t.useCallback)((e=>{if(!h({value:e,tabValues:s}))throw new Error(`Can't select invalid tab value=${e}`);c(e),u(e),f(e)}),[u,f,s]),tabValues:s}}var f=n(2303);const x={tabList:"tabList__CuJ",tabItem:"tabItem_LNqP"};var v=n(4848);function j(e){let{className:r,block:n,selectedValue:t,selectValue:o,tabValues:l}=e;const c=[],{blockElementScrollPositionUntilNextRender:i}=(0,s.a_)(),d=e=>{const r=e.currentTarget,n=c.indexOf(r),a=l[n].value;a!==t&&(i(r),o(a))},u=e=>{let r=null;switch(e.key){case"Enter":d(e);break;case"ArrowRight":{const n=c.indexOf(e.currentTarget)+1;r=c[n]??c[0];break}case"ArrowLeft":{const n=c.indexOf(e.currentTarget)-1;r=c[n]??c[c.length-1];break}}r?.focus()};return(0,v.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,a.A)("tabs",{"tabs--block":n},r),children:l.map((e=>{let{value:r,label:n,attributes:s}=e;return(0,v.jsx)("li",{role:"tab",tabIndex:t===r?0:-1,"aria-selected":t===r,ref:e=>c.push(e),onKeyDown:u,onClick:d,...s,className:(0,a.A)("tabs__item",x.tabItem,s?.className,{"tabs__item--active":t===r}),children:n??r},r)}))})}function g(e){let{lazy:r,children:n,selectedValue:a}=e;const s=(Array.isArray(n)?n:[n]).filter(Boolean);if(r){const e=s.find((e=>e.props.value===a));return e?(0,t.cloneElement)(e,{className:"margin-top--md"}):null}return(0,v.jsx)("div",{className:"margin-top--md",children:s.map(((e,r)=>(0,t.cloneElement)(e,{key:r,hidden:e.props.value!==a})))})}function y(e){const r=b(e);return(0,v.jsxs)("div",{className:(0,a.A)("tabs-container",x.tabList),children:[(0,v.jsx)(j,{...e,...r}),(0,v.jsx)(g,{...e,...r})]})}function D(e){const r=(0,f.A)();return(0,v.jsx)(y,{...e,children:u(e.children)},String(r))}},8453:(e,r,n)=>{n.d(r,{R:()=>o,x:()=>l});var t=n(6540);const a={},s=t.createContext(a);function o(e){const r=t.useContext(s);return t.useMemo((function(){return"function"==typeof e?e(r):{...r,...e}}),[r,e])}function l(e){let r;return r=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:o(e.components),t.createElement(s.Provider,{value:r},e.children)}}}]);
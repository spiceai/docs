"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[1545],{6852:(e,n,r)=>{r.r(n),r.d(n,{assets:()=>d,contentTitle:()=>l,default:()=>p,frontMatter:()=>c,metadata:()=>i,toc:()=>u});var t=r(4848),a=r(8453),s=r(1470),o=r(9365);const c={title:"Dremio Data Connector",sidebar_label:"Dremio Data Connector",description:"Dremio Data Connector Documentation"},l=void 0,i={id:"components/data-connectors/dremio",title:"Dremio Data Connector",description:"Dremio Data Connector Documentation",source:"@site/docs/components/data-connectors/dremio.md",sourceDirName:"components/data-connectors",slug:"/components/data-connectors/dremio",permalink:"/components/data-connectors/dremio",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/components/data-connectors/dremio.md",tags:[],version:"current",frontMatter:{title:"Dremio Data Connector",sidebar_label:"Dremio Data Connector",description:"Dremio Data Connector Documentation"},sidebar:"docsSidebar",previous:{title:"Delta Lake Data Connector",permalink:"/components/data-connectors/delta-lake"},next:{title:"DuckDB Data Connector",permalink:"/components/data-connectors/duckdb"}},d={},u=[{value:"<code>params</code>",id:"params",level:2},{value:"Auth",id:"auth",level:2},{value:"Example",id:"example",level:2}];function m(e){const n={a:"a",code:"code",h2:"h2",li:"li",p:"p",pre:"pre",ul:"ul",...(0,a.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.a,{href:"https://www.dremio.com/",children:"Dremio"})," server as a connector for federated SQL queries."]}),"\n",(0,t.jsxs)(n.p,{children:["By default Dremio connector will look for a secret named ",(0,t.jsx)(n.code,{children:"dremio"})," with"]}),"\n",(0,t.jsx)(n.h2,{id:"params",children:(0,t.jsx)(n.code,{children:"params"})}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"endpoint"}),": The endpoint used to connect to the Dremio server."]}),"\n"]}),"\n",(0,t.jsx)(n.h2,{id:"auth",children:"Auth"}),"\n",(0,t.jsxs)(n.p,{children:["Username and password credentials are required to log into the Dremio Server.\nBy default Dremio connector will look for a secret named ",(0,t.jsx)(n.code,{children:"dremio"})," with keys ",(0,t.jsx)(n.code,{children:"username"})," and ",(0,t.jsx)(n.code,{children:"password"}),"."]}),"\n",(0,t.jsxs)(n.p,{children:["Check ",(0,t.jsx)(n.a,{href:"/components/secret-stores",children:"Secrets Stores"})," for more details."]}),"\n",(0,t.jsxs)(s.A,{children:[(0,t.jsxs)(o.A,{value:"local",label:"Local",default:!0,children:[(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-bash",children:"spice login dremio -u demo -p demo1234\n"})}),(0,t.jsxs)(n.p,{children:["Learn more about ",(0,t.jsx)(n.a,{href:"/components/secret-stores/file",children:"File Secret Store"}),"."]})]}),(0,t.jsxs)(o.A,{value:"env",label:"Env",children:[(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-bash",children:"SPICE_SECRET_DREMIO_USERNAME=demo \\\nSPICE_SECRET_DREMIO_PASSWORD=demo1234 \\\nspice run\n"})}),(0,t.jsx)(n.p,{children:(0,t.jsx)(n.code,{children:"spicepod.yaml"})}),(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-yaml",children:"version: v1beta1\nkind: Spicepod\nname: spice-app\n\nsecrets:\n  store: env\n\n# <...>\n"})}),(0,t.jsxs)(n.p,{children:["Learn more about ",(0,t.jsx)(n.a,{href:"/components/secret-stores/env",children:"Env Secret Store"}),"."]})]}),(0,t.jsxs)(o.A,{value:"k8s",label:"Kubernetes",children:[(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-bash",children:"kubectl create secret generic dremio \\\n  --from-literal=username='demo' \\\n  --from-literal=password='demo1234'\n"})}),(0,t.jsx)(n.p,{children:(0,t.jsx)(n.code,{children:"spicepod.yaml"})}),(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-yaml",children:"version: v1beta1\nkind: Spicepod\nname: spice-app\n\nsecrets:\n  store: kubernetes\n\n# <...>\n"})}),(0,t.jsxs)(n.p,{children:["Learn more about ",(0,t.jsx)(n.a,{href:"/components/secret-stores/kubernetes",children:"Kubernetes Secret Store"}),"."]})]}),(0,t.jsxs)(o.A,{value:"keyring",label:"Keyring",children:[(0,t.jsx)(n.p,{children:"Add new keychain entry (macOS), with user and password in JSON string"}),(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-bash",children:'security add-generic-password -l "Dremio Secret" \\\n-a spiced -s spice_secret_dremio \\\n-w $(echo -n \'{"username": "demo", "password": "demo1234"}\')\n'})}),(0,t.jsx)(n.p,{children:(0,t.jsx)(n.code,{children:"spicepod.yaml"})}),(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-yaml",children:"version: v1beta1\nkind: Spicepod\nname: spice-app\n\nsecrets:\n  store: keyring\n\n# <...>\n"})}),(0,t.jsxs)(n.p,{children:["Learn more about ",(0,t.jsx)(n.a,{href:"/components/secret-stores/keyring",children:"Keyring Secret Store"}),"."]})]})]}),"\n",(0,t.jsx)(n.h2,{id:"example",children:"Example"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-yaml",children:"- from: dremio:datasets.dremio_dataset\n  name: dremio_dataset\n  params:\n    endpoint: grpc://127.0.0.1:32010\n"})})]})}function p(e={}){const{wrapper:n}={...(0,a.R)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(m,{...e})}):m(e)}},9365:(e,n,r)=>{r.d(n,{A:()=>o});r(6540);var t=r(4164);const a={tabItem:"tabItem_Ymn6"};var s=r(4848);function o(e){let{children:n,hidden:r,className:o}=e;return(0,s.jsx)("div",{role:"tabpanel",className:(0,t.A)(a.tabItem,o),hidden:r,children:n})}},1470:(e,n,r)=>{r.d(n,{A:()=>D});var t=r(6540),a=r(4164),s=r(3104),o=r(6347),c=r(205),l=r(7485),i=r(1682),d=r(679);function u(e){return t.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,t.isValidElement)(e)&&function(e){const{props:n}=e;return!!n&&"object"==typeof n&&"value"in n}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function m(e){const{values:n,children:r}=e;return(0,t.useMemo)((()=>{const e=n??function(e){return u(e).map((e=>{let{props:{value:n,label:r,attributes:t,default:a}}=e;return{value:n,label:r,attributes:t,default:a}}))}(r);return function(e){const n=(0,i.X)(e,((e,n)=>e.value===n.value));if(n.length>0)throw new Error(`Docusaurus error: Duplicate values "${n.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[n,r])}function p(e){let{value:n,tabValues:r}=e;return r.some((e=>e.value===n))}function h(e){let{queryString:n=!1,groupId:r}=e;const a=(0,o.W6)(),s=function(e){let{queryString:n=!1,groupId:r}=e;if("string"==typeof n)return n;if(!1===n)return null;if(!0===n&&!r)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return r??null}({queryString:n,groupId:r});return[(0,l.aZ)(s),(0,t.useCallback)((e=>{if(!s)return;const n=new URLSearchParams(a.location.search);n.set(s,e),a.replace({...a.location,search:n.toString()})}),[s,a])]}function b(e){const{defaultValue:n,queryString:r=!1,groupId:a}=e,s=m(e),[o,l]=(0,t.useState)((()=>function(e){let{defaultValue:n,tabValues:r}=e;if(0===r.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(n){if(!p({value:n,tabValues:r}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${n}" but none of its children has the corresponding value. Available values are: ${r.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return n}const t=r.find((e=>e.default))??r[0];if(!t)throw new Error("Unexpected error: 0 tabValues");return t.value}({defaultValue:n,tabValues:s}))),[i,u]=h({queryString:r,groupId:a}),[b,f]=function(e){let{groupId:n}=e;const r=function(e){return e?`docusaurus.tab.${e}`:null}(n),[a,s]=(0,d.Dv)(r);return[a,(0,t.useCallback)((e=>{r&&s.set(e)}),[r,s])]}({groupId:a}),x=(()=>{const e=i??b;return p({value:e,tabValues:s})?e:null})();(0,c.A)((()=>{x&&l(x)}),[x]);return{selectedValue:o,selectValue:(0,t.useCallback)((e=>{if(!p({value:e,tabValues:s}))throw new Error(`Can't select invalid tab value=${e}`);l(e),u(e),f(e)}),[u,f,s]),tabValues:s}}var f=r(2303);const x={tabList:"tabList__CuJ",tabItem:"tabItem_LNqP"};var v=r(4848);function j(e){let{className:n,block:r,selectedValue:t,selectValue:o,tabValues:c}=e;const l=[],{blockElementScrollPositionUntilNextRender:i}=(0,s.a_)(),d=e=>{const n=e.currentTarget,r=l.indexOf(n),a=c[r].value;a!==t&&(i(n),o(a))},u=e=>{let n=null;switch(e.key){case"Enter":d(e);break;case"ArrowRight":{const r=l.indexOf(e.currentTarget)+1;n=l[r]??l[0];break}case"ArrowLeft":{const r=l.indexOf(e.currentTarget)-1;n=l[r]??l[l.length-1];break}}n?.focus()};return(0,v.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,a.A)("tabs",{"tabs--block":r},n),children:c.map((e=>{let{value:n,label:r,attributes:s}=e;return(0,v.jsx)("li",{role:"tab",tabIndex:t===n?0:-1,"aria-selected":t===n,ref:e=>l.push(e),onKeyDown:u,onClick:d,...s,className:(0,a.A)("tabs__item",x.tabItem,s?.className,{"tabs__item--active":t===n}),children:r??n},n)}))})}function g(e){let{lazy:n,children:r,selectedValue:a}=e;const s=(Array.isArray(r)?r:[r]).filter(Boolean);if(n){const e=s.find((e=>e.props.value===a));return e?(0,t.cloneElement)(e,{className:"margin-top--md"}):null}return(0,v.jsx)("div",{className:"margin-top--md",children:s.map(((e,n)=>(0,t.cloneElement)(e,{key:n,hidden:e.props.value!==a})))})}function y(e){const n=b(e);return(0,v.jsxs)("div",{className:(0,a.A)("tabs-container",x.tabList),children:[(0,v.jsx)(j,{...n,...e}),(0,v.jsx)(g,{...n,...e})]})}function D(e){const n=(0,f.A)();return(0,v.jsx)(y,{...e,children:u(e.children)},String(n))}},8453:(e,n,r)=>{r.d(n,{R:()=>o,x:()=>c});var t=r(6540);const a={},s=t.createContext(a);function o(e){const n=t.useContext(s);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:o(e.components),t.createElement(s.Provider,{value:n},e.children)}}}]);
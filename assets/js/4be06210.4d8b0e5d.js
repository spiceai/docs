"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[6909],{7796:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>u,contentTitle:()=>c,default:()=>p,frontMatter:()=>o,metadata:()=>i,toc:()=>d});var r=t(4848),a=t(8453),s=t(1470),l=t(9365);const o={title:"Flight SQL Data Connector",sidebar_label:"Flight SQL Data Connector",description:"Flight SQL Data Connector Documentation"},c=void 0,i={id:"data-connectors/flightsql",title:"Flight SQL Data Connector",description:"Flight SQL Data Connector Documentation",source:"@site/docs/data-connectors/flightsql.md",sourceDirName:"data-connectors",slug:"/data-connectors/flightsql",permalink:"/data-connectors/flightsql",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/data-connectors/flightsql.md",tags:[],version:"current",frontMatter:{title:"Flight SQL Data Connector",sidebar_label:"Flight SQL Data Connector",description:"Flight SQL Data Connector Documentation"},sidebar:"docsSidebar",previous:{title:"DuckDB Data Connector",permalink:"/data-connectors/duckdb"},next:{title:"FTP/SFTP Data Connector",permalink:"/data-connectors/ftp"}},u={},d=[{value:"<code>params</code>",id:"params",level:2},{value:"Auth",id:"auth",level:2},{value:"Example",id:"example",level:2}];function h(e){const n={a:"a",code:"code",h2:"h2",li:"li",p:"p",pre:"pre",ul:"ul",...(0,a.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.p,{children:"Connect to any Flight SQL compatible server (e.g. Influx 3.0, CnosDB, other Spice runtimes!) as a connector for federated SQL queries."}),"\n",(0,r.jsx)(n.h2,{id:"params",children:(0,r.jsx)(n.code,{children:"params"})}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"endpoint"}),": The Apache Flight endpoint used to connect to the Flight SQL server."]}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"auth",children:"Auth"}),"\n",(0,r.jsx)(n.p,{children:"Username and password credentials can be specified to connect to the Flight SQL server:"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"username"})," (optional): The username to use in the underlying Apache flight Handshake Request to authenticate to the server (see ",(0,r.jsx)(n.a,{href:"https://arrow.apache.org/docs/format/Flight.html#authentication",children:"reference"}),")."]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"password"})," (optional): The password to use in the underlying Apache flight Handshake Request to authenticate to the server (see ",(0,r.jsx)(n.a,{href:"https://arrow.apache.org/docs/format/Flight.html#authentication",children:"reference"}),")."]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["By default Flight SQL connector will look for a secret named ",(0,r.jsx)(n.code,{children:"flightsql"})," with keys ",(0,r.jsx)(n.code,{children:"username"})," and ",(0,r.jsx)(n.code,{children:"password"}),"."]}),"\n",(0,r.jsxs)(n.p,{children:["Check ",(0,r.jsx)(n.a,{href:"/secret-stores",children:"Secrets Stores"})," for more details."]}),"\n",(0,r.jsxs)(s.A,{children:[(0,r.jsxs)(l.A,{value:"env",label:"Env",children:[(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-bash",children:"SPICE_SECRET_FLIGHTSQL_USERNAME=<flight_username> \\\nSPICE_SECRET_FLIGHTSQL_PASSWORD=<flight_password> \\\nspice run\n"})}),(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"spicepod.yaml"})}),(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-yaml",children:"version: v1beta1\nkind: Spicepod\nname: spice-app\n\nsecrets:\n  store: env\n\n# <...>\n"})}),(0,r.jsxs)(n.p,{children:["Learn more about ",(0,r.jsx)(n.a,{href:"/secret-stores/env",children:"Env Secret Store"}),"."]})]}),(0,r.jsxs)(l.A,{value:"k8s",label:"Kubernetes",children:[(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-bash",children:"kubectl create secret generic flightsql \\\n  --from-literal=username='<flight_username>' \\\n  --from-literal=password='<flight_password>'\n"})}),(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"spicepod.yaml"})}),(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-yaml",children:"version: v1beta1\nkind: Spicepod\nname: spice-app\n\nsecrets:\n  store: kubernetes\n\n# <...>\n"})}),(0,r.jsxs)(n.p,{children:["Learn more about ",(0,r.jsx)(n.a,{href:"/secret-stores/kubernetes",children:"Kubernetes Secret Store"}),"."]})]}),(0,r.jsxs)(l.A,{value:"keyring",label:"Keyring",children:[(0,r.jsx)(n.p,{children:"Add new keychain entry (macOS), with user and password in JSON string"}),(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-bash",children:'security add-generic-password -l "Flight SQL Secret" \\\n-a spiced -s spice_secret_flightsql \\\n-w $(echo -n \'{"username": "<flight_username>", "password": "<flight_password>"}\')\n'})}),(0,r.jsx)(n.p,{children:(0,r.jsx)(n.code,{children:"spicepod.yaml"})}),(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-yaml",children:"version: v1beta1\nkind: Spicepod\nname: spice-app\n\nsecrets:\n  store: keyring\n\n# <...>\n"})}),(0,r.jsxs)(n.p,{children:["Learn more about ",(0,r.jsx)(n.a,{href:"/secret-stores/keyring",children:"Keyring Secret Store"}),"."]})]})]}),"\n",(0,r.jsx)(n.h2,{id:"example",children:"Example"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-yaml",children:"- from: flightsql:my_catalog.good_schemas.cool_dataset\n  name: cool_dataset\n  params:\n    endpoint: http://127.0.0.1:50051 \n"})})]})}function p(e={}){const{wrapper:n}={...(0,a.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(h,{...e})}):h(e)}},9365:(e,n,t)=>{t.d(n,{A:()=>l});t(6540);var r=t(4164);const a={tabItem:"tabItem_Ymn6"};var s=t(4848);function l(e){let{children:n,hidden:t,className:l}=e;return(0,s.jsx)("div",{role:"tabpanel",className:(0,r.A)(a.tabItem,l),hidden:t,children:n})}},1470:(e,n,t)=>{t.d(n,{A:()=>y});var r=t(6540),a=t(4164),s=t(3104),l=t(6347),o=t(205),c=t(7485),i=t(1682),u=t(9466);function d(e){return r.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,r.isValidElement)(e)&&function(e){const{props:n}=e;return!!n&&"object"==typeof n&&"value"in n}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function h(e){const{values:n,children:t}=e;return(0,r.useMemo)((()=>{const e=n??function(e){return d(e).map((e=>{let{props:{value:n,label:t,attributes:r,default:a}}=e;return{value:n,label:t,attributes:r,default:a}}))}(t);return function(e){const n=(0,i.X)(e,((e,n)=>e.value===n.value));if(n.length>0)throw new Error(`Docusaurus error: Duplicate values "${n.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[n,t])}function p(e){let{value:n,tabValues:t}=e;return t.some((e=>e.value===n))}function m(e){let{queryString:n=!1,groupId:t}=e;const a=(0,l.W6)(),s=function(e){let{queryString:n=!1,groupId:t}=e;if("string"==typeof n)return n;if(!1===n)return null;if(!0===n&&!t)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return t??null}({queryString:n,groupId:t});return[(0,c.aZ)(s),(0,r.useCallback)((e=>{if(!s)return;const n=new URLSearchParams(a.location.search);n.set(s,e),a.replace({...a.location,search:n.toString()})}),[s,a])]}function f(e){const{defaultValue:n,queryString:t=!1,groupId:a}=e,s=h(e),[l,c]=(0,r.useState)((()=>function(e){let{defaultValue:n,tabValues:t}=e;if(0===t.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(n){if(!p({value:n,tabValues:t}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${n}" but none of its children has the corresponding value. Available values are: ${t.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return n}const r=t.find((e=>e.default))??t[0];if(!r)throw new Error("Unexpected error: 0 tabValues");return r.value}({defaultValue:n,tabValues:s}))),[i,d]=m({queryString:t,groupId:a}),[f,g]=function(e){let{groupId:n}=e;const t=function(e){return e?`docusaurus.tab.${e}`:null}(n),[a,s]=(0,u.Dv)(t);return[a,(0,r.useCallback)((e=>{t&&s.set(e)}),[t,s])]}({groupId:a}),b=(()=>{const e=i??f;return p({value:e,tabValues:s})?e:null})();(0,o.A)((()=>{b&&c(b)}),[b]);return{selectedValue:l,selectValue:(0,r.useCallback)((e=>{if(!p({value:e,tabValues:s}))throw new Error(`Can't select invalid tab value=${e}`);c(e),d(e),g(e)}),[d,g,s]),tabValues:s}}var g=t(2303);const b={tabList:"tabList__CuJ",tabItem:"tabItem_LNqP"};var x=t(4848);function v(e){let{className:n,block:t,selectedValue:r,selectValue:l,tabValues:o}=e;const c=[],{blockElementScrollPositionUntilNextRender:i}=(0,s.a_)(),u=e=>{const n=e.currentTarget,t=c.indexOf(n),a=o[t].value;a!==r&&(i(n),l(a))},d=e=>{let n=null;switch(e.key){case"Enter":u(e);break;case"ArrowRight":{const t=c.indexOf(e.currentTarget)+1;n=c[t]??c[0];break}case"ArrowLeft":{const t=c.indexOf(e.currentTarget)-1;n=c[t]??c[c.length-1];break}}n?.focus()};return(0,x.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,a.A)("tabs",{"tabs--block":t},n),children:o.map((e=>{let{value:n,label:t,attributes:s}=e;return(0,x.jsx)("li",{role:"tab",tabIndex:r===n?0:-1,"aria-selected":r===n,ref:e=>c.push(e),onKeyDown:d,onClick:u,...s,className:(0,a.A)("tabs__item",b.tabItem,s?.className,{"tabs__item--active":r===n}),children:t??n},n)}))})}function j(e){let{lazy:n,children:t,selectedValue:a}=e;const s=(Array.isArray(t)?t:[t]).filter(Boolean);if(n){const e=s.find((e=>e.props.value===a));return e?(0,r.cloneElement)(e,{className:"margin-top--md"}):null}return(0,x.jsx)("div",{className:"margin-top--md",children:s.map(((e,n)=>(0,r.cloneElement)(e,{key:n,hidden:e.props.value!==a})))})}function S(e){const n=f(e);return(0,x.jsxs)("div",{className:(0,a.A)("tabs-container",b.tabList),children:[(0,x.jsx)(v,{...e,...n}),(0,x.jsx)(j,{...e,...n})]})}function y(e){const n=(0,g.A)();return(0,x.jsx)(S,{...e,children:d(e.children)},String(n))}},8453:(e,n,t)=>{t.d(n,{R:()=>l,x:()=>o});var r=t(6540);const a={},s=r.createContext(a);function l(e){const n=r.useContext(s);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:l(e.components),r.createElement(s.Provider,{value:n},e.children)}}}]);
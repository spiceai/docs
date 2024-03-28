"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[7174],{8281:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>u,default:()=>m,frontMatter:()=>o,metadata:()=>i,toc:()=>p});var r=n(4848),a=n(8453),s=n(1470),l=n(9365);const o={title:"HTTP API",sidebar_label:"HTTP",description:"Directly call the Spice runtime via HTTP requests",pagination_prev:"clients/index",pagination_next:null},u=void 0,i={id:"clients/http_api/index",title:"HTTP API",description:"Directly call the Spice runtime via HTTP requests",source:"@site/docs/clients/http_api/index.md",sourceDirName:"clients/http_api",slug:"/clients/http_api/",permalink:"/clients/http_api/",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/clients/http_api/index.md",tags:[],version:"current",frontMatter:{title:"HTTP API",sidebar_label:"HTTP",description:"Directly call the Spice runtime via HTTP requests",pagination_prev:"clients/index",pagination_next:null},sidebar:"docsSidebar",previous:{title:"Clients and Tools",permalink:"/clients/"}},c={},p=[];function d(e){const t={code:"code",p:"p",pre:"pre",...(0,a.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(t.p,{children:"The Spice runtime supports SQL queries directly from HTTP requests."}),"\n",(0,r.jsx)(t.p,{children:"An example CuRL"}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-shell",children:'curl -XPOST "127.0.0.1:3000/v1/sql" \\\n     --data "SELECT avg(total_amount), \\\n                    avg(tip_amount), \\\n                    count(1), \\\n                    passenger_count \\\n              FROM my_table \\\n              GROUP BY passenger_count \\\n              ORDER BY passenger_count ASC \\\n              LIMIT 3"\n'})}),"\n",(0,r.jsx)(t.p,{children:"And response"}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-json",children:'[\n    {\n        "AVG(my_table.tip_amount)": 3.072259971396793,\n        "AVG(my_table.total_amount)": 25.327816939456525,\n        "COUNT(Int64(1))": 31465,\n        "passenger_count": 0\n    },\n    {\n        "AVG(my_table.tip_amount)": 3.3712622884680057,\n        "AVG(my_table.total_amount)": 26.205230445474996,\n        "COUNT(Int64(1))": 2188739,\n        "passenger_count": 1\n    },\n    {\n        "AVG(my_table.tip_amount)": 3.7171302113290854,\n        "AVG(my_table.total_amount)": 29.520659930930304,\n        "COUNT(Int64(1))": 405103,\n        "passenger_count": 2\n    }\n]\n'})}),"\n",(0,r.jsx)(t.p,{children:"This allows for simple integrating into any language or framework"}),"\n",(0,r.jsxs)(s.A,{children:[(0,r.jsx)(l.A,{value:"python",label:"Python",default:!0,children:(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-python",children:'from typing import Optional\nimport requests\nimport pandas as pd\n\ndef query_runtime(query: str, url: str =  "http://127.0.0.1:3000") -> Optional[pd.DataFrame]:\n    response = requests.post(url, data=query)\n    \n    if response.status_code != 200:\n        print(f"Error: Received status code {response.status_code}")\n        return None\n    \n    return pd.DataFrame(response.json())\n'})})}),(0,r.jsx)(l.A,{value:"javascript",label:"Javascript",children:(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-javascript",children:"async function queryRuntime(query, url = \"http://127.0.0.1:3000\") {\n    try {\n        const response = await fetch(url, {method: 'POST', body: query});\n        if (!response.ok) {\n        console.error(`Error: Received status code ${response.status}`);\n        return null;\n        }\n\n        return await response.json();\n    } catch (error) {\n        return error;\n    }\n}\n"})})})]}),"\n",(0,r.jsx)(t.p,{children:"Full SDK support coming soon!"})]})}function m(e={}){const{wrapper:t}={...(0,a.R)(),...e.components};return t?(0,r.jsx)(t,{...e,children:(0,r.jsx)(d,{...e})}):d(e)}},9365:(e,t,n)=>{n.d(t,{A:()=>l});n(6540);var r=n(4164);const a={tabItem:"tabItem_Ymn6"};var s=n(4848);function l(e){let{children:t,hidden:n,className:l}=e;return(0,s.jsx)("div",{role:"tabpanel",className:(0,r.A)(a.tabItem,l),hidden:n,children:t})}},1470:(e,t,n)=>{n.d(t,{A:()=>T});var r=n(6540),a=n(4164),s=n(3104),l=n(6347),o=n(205),u=n(7485),i=n(1682),c=n(9466);function p(e){return r.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,r.isValidElement)(e)&&function(e){const{props:t}=e;return!!t&&"object"==typeof t&&"value"in t}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function d(e){const{values:t,children:n}=e;return(0,r.useMemo)((()=>{const e=t??function(e){return p(e).map((e=>{let{props:{value:t,label:n,attributes:r,default:a}}=e;return{value:t,label:n,attributes:r,default:a}}))}(n);return function(e){const t=(0,i.X)(e,((e,t)=>e.value===t.value));if(t.length>0)throw new Error(`Docusaurus error: Duplicate values "${t.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[t,n])}function m(e){let{value:t,tabValues:n}=e;return n.some((e=>e.value===t))}function h(e){let{queryString:t=!1,groupId:n}=e;const a=(0,l.W6)(),s=function(e){let{queryString:t=!1,groupId:n}=e;if("string"==typeof t)return t;if(!1===t)return null;if(!0===t&&!n)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return n??null}({queryString:t,groupId:n});return[(0,u.aZ)(s),(0,r.useCallback)((e=>{if(!s)return;const t=new URLSearchParams(a.location.search);t.set(s,e),a.replace({...a.location,search:t.toString()})}),[s,a])]}function f(e){const{defaultValue:t,queryString:n=!1,groupId:a}=e,s=d(e),[l,u]=(0,r.useState)((()=>function(e){let{defaultValue:t,tabValues:n}=e;if(0===n.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(t){if(!m({value:t,tabValues:n}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${t}" but none of its children has the corresponding value. Available values are: ${n.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return t}const r=n.find((e=>e.default))??n[0];if(!r)throw new Error("Unexpected error: 0 tabValues");return r.value}({defaultValue:t,tabValues:s}))),[i,p]=h({queryString:n,groupId:a}),[f,b]=function(e){let{groupId:t}=e;const n=function(e){return e?`docusaurus.tab.${e}`:null}(t),[a,s]=(0,c.Dv)(n);return[a,(0,r.useCallback)((e=>{n&&s.set(e)}),[n,s])]}({groupId:a}),v=(()=>{const e=i??f;return m({value:e,tabValues:s})?e:null})();(0,o.A)((()=>{v&&u(v)}),[v]);return{selectedValue:l,selectValue:(0,r.useCallback)((e=>{if(!m({value:e,tabValues:s}))throw new Error(`Can't select invalid tab value=${e}`);u(e),p(e),b(e)}),[p,b,s]),tabValues:s}}var b=n(2303);const v={tabList:"tabList__CuJ",tabItem:"tabItem_LNqP"};var g=n(4848);function y(e){let{className:t,block:n,selectedValue:r,selectValue:l,tabValues:o}=e;const u=[],{blockElementScrollPositionUntilNextRender:i}=(0,s.a_)(),c=e=>{const t=e.currentTarget,n=u.indexOf(t),a=o[n].value;a!==r&&(i(t),l(a))},p=e=>{let t=null;switch(e.key){case"Enter":c(e);break;case"ArrowRight":{const n=u.indexOf(e.currentTarget)+1;t=u[n]??u[0];break}case"ArrowLeft":{const n=u.indexOf(e.currentTarget)-1;t=u[n]??u[u.length-1];break}}t?.focus()};return(0,g.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,a.A)("tabs",{"tabs--block":n},t),children:o.map((e=>{let{value:t,label:n,attributes:s}=e;return(0,g.jsx)("li",{role:"tab",tabIndex:r===t?0:-1,"aria-selected":r===t,ref:e=>u.push(e),onKeyDown:p,onClick:c,...s,className:(0,a.A)("tabs__item",v.tabItem,s?.className,{"tabs__item--active":r===t}),children:n??t},t)}))})}function x(e){let{lazy:t,children:n,selectedValue:a}=e;const s=(Array.isArray(n)?n:[n]).filter(Boolean);if(t){const e=s.find((e=>e.props.value===a));return e?(0,r.cloneElement)(e,{className:"margin-top--md"}):null}return(0,g.jsx)("div",{className:"margin-top--md",children:s.map(((e,t)=>(0,r.cloneElement)(e,{key:t,hidden:e.props.value!==a})))})}function _(e){const t=f(e);return(0,g.jsxs)("div",{className:(0,a.A)("tabs-container",v.tabList),children:[(0,g.jsx)(y,{...e,...t}),(0,g.jsx)(x,{...e,...t})]})}function T(e){const t=(0,b.A)();return(0,g.jsx)(_,{...e,children:p(e.children)},String(t))}},8453:(e,t,n)=>{n.d(t,{R:()=>l,x:()=>o});var r=n(6540);const a={},s=r.createContext(a);function l(e){const t=r.useContext(s);return r.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function o(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:l(e.components),r.createElement(s.Provider,{value:t},e.children)}}}]);
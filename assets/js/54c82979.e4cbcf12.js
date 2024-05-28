"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[2254],{9761:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>o,default:()=>m,frontMatter:()=>c,metadata:()=>u,toc:()=>p});var r=n(4848),s=n(8453),i=n(1470),a=n(9365),l=n(3514);const c={title:"Getting started with Spice.ai OSS",sidebar_label:"Getting started",sidebar_position:1,description:"Get started with Spice in 5 minutes",pagination_next:null},o=void 0,u={id:"getting-started/index",title:"Getting started with Spice.ai OSS",description:"Get started with Spice in 5 minutes",source:"@site/docs/getting-started/index.md",sourceDirName:"getting-started",slug:"/getting-started/",permalink:"/getting-started/",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/getting-started/index.md",tags:[],version:"current",sidebarPosition:1,frontMatter:{title:"Getting started with Spice.ai OSS",sidebar_label:"Getting started",sidebar_position:1,description:"Get started with Spice in 5 minutes",pagination_next:null},sidebar:"docsSidebar",previous:{title:"Installation",permalink:"/installation"}},d={},p=[{value:"Follow these steps to get started with Spice.",id:"follow-these-steps-to-get-started-with-spice",level:3},{value:"Next Steps",id:"next-steps",level:2}];function h(e){const t={code:"code",h2:"h2",h3:"h3",p:"p",pre:"pre",strong:"strong",...(0,s.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("div",{className:"video-container",children:(0,r.jsx)("iframe",{width:"560",height:"420",src:"https://www.youtube.com/embed/AZyrecVWnEs?si=2s_2jLTJlUdgItyC",title:"YouTube video player",frameborder:"0",allow:"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",referrerpolicy:"strict-origin-when-cross-origin",allowfullscreen:!0})}),"\n",(0,r.jsx)(t.h3,{id:"follow-these-steps-to-get-started-with-spice",children:"Follow these steps to get started with Spice."}),"\n",(0,r.jsxs)(t.p,{children:[(0,r.jsx)(t.strong,{children:"Step 1."})," Install the Spice CLI:"]}),"\n",(0,r.jsxs)(i.A,{children:[(0,r.jsxs)(a.A,{value:"default",label:"macOS, Linux, and WSL",default:!0,children:[(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-bash",children:"curl https://install.spiceai.org | /bin/bash\n"})}),(0,r.jsxs)(t.p,{children:["Or using ",(0,r.jsx)(t.code,{children:"brew"}),":"]}),(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-bash",children:"brew install spiceai/spiceai/spice\n"})})]}),(0,r.jsx)(a.A,{value:"windows",label:"Windows",default:!0,children:(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-bash",children:'curl -L "https://install.spiceai.org/Install.ps1" -o Install.ps1 && PowerShell -ExecutionPolicy Bypass -File ./Install.ps1\n'})})})]}),"\n",(0,r.jsxs)(t.p,{children:[(0,r.jsx)(t.strong,{children:"Step 2."})," Initialize a new Spice app with the ",(0,r.jsx)(t.code,{children:"spice init"})," command:"]}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-bash",children:"spice init spice_qs\n"})}),"\n",(0,r.jsxs)(t.p,{children:["A ",(0,r.jsx)(t.code,{children:"spicepod.yaml"})," file is created in the ",(0,r.jsx)(t.code,{children:"spice_qs"})," directory. Change to that directory:"]}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-bash",children:"cd spice_qs\n"})}),"\n",(0,r.jsxs)(t.p,{children:[(0,r.jsx)(t.strong,{children:"Step 3."})," Start the Spice runtime:"]}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-bash",children:"spice run\n"})}),"\n",(0,r.jsx)(t.p,{children:"Example output will be shown as follows:"}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-bash",children:"Spice.ai runtime starting...\nUsing latest 'local' runtime version.\n2024-05-20T22:37:26.787577Z  INFO spiced: Metrics listening on 127.0.0.1:9000\n2024-05-20T22:37:26.788298Z  INFO runtime::http: Spice Runtime HTTP listening on 127.0.0.1:3000\n2024-05-20T22:37:26.788329Z  INFO runtime::flight: Spice Runtime Flight listening on 127.0.0.1:50051\n2024-05-20T22:37:26.788402Z  INFO runtime::opentelemetry: Spice Runtime OpenTelemetry listening on 127.0.0.1:50052\n"})}),"\n",(0,r.jsx)(t.p,{children:"The runtime is now started and ready for queries."}),"\n",(0,r.jsxs)(t.p,{children:[(0,r.jsx)(t.strong,{children:"Step 4."})," In a new terminal window, add the ",(0,r.jsx)(t.code,{children:"spiceai/quickstart"})," Spicepod. A Spicepod is a package of configuration defining datasets and ML models."]}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-bash",children:"spice add spiceai/quickstart\n"})}),"\n",(0,r.jsxs)(t.p,{children:["The ",(0,r.jsx)(t.code,{children:"spicepod.yaml"})," file will be updated with the ",(0,r.jsx)(t.code,{children:"spiceai/quickstart"})," dependency."]}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-yaml",children:"version: v1beta1\nkind: Spicepod\nname: PROJECT_NAME\ndependencies:\n  - spiceai/quickstart\n"})}),"\n",(0,r.jsxs)(t.p,{children:["The ",(0,r.jsx)(t.code,{children:"spiceai/quickstart"})," Spicepod will add a ",(0,r.jsx)(t.code,{children:"taxi_trips"})," data table to the runtime which is now available to query by SQL."]}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-bash",children:"2024-02-22T05:53:48.222952Z  INFO runtime: Registered dataset taxi_trips\n2024-02-22T05:53:48.223101Z  INFO runtime::dataconnector::refresh: Loading data for dataset taxi_trips\n"})}),"\n",(0,r.jsxs)(t.p,{children:[(0,r.jsx)(t.strong,{children:"Step 5."})," Start the Spice SQL REPL:"]}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-bash",children:"spice sql\n"})}),"\n",(0,r.jsx)(t.p,{children:"The SQL REPL inferface will be shown:"}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{children:"Welcome to the Spice.ai SQL REPL! Type 'help' for help.\n\nshow tables; -- list available tables\nsql>\n"})}),"\n",(0,r.jsxs)(t.p,{children:["Enter ",(0,r.jsx)(t.code,{children:"show tables;"})," to display the available tables for query:"]}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{children:"sql> show tables\n+---------------+--------------+---------------+------------+\n| table_catalog | table_schema | table_name    | table_type |\n+---------------+--------------+---------------+------------+\n| spice         | runtime      | metrics       | BASE TABLE |\n| spice         | runtime      | query_history | BASE TABLE |\n| spice         | public       | taxi_trips    | BASE TABLE |\n+---------------+--------------+---------------+------------+\n\nTime: 0.007505084 seconds. 1 rows.\n"})}),"\n",(0,r.jsx)(t.p,{children:"Enter a query to display the longest taxi trips:"}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{children:"sql> SELECT trip_distance, total_amount FROM taxi_trips ORDER BY trip_distance DESC LIMIT 10;\n"})}),"\n",(0,r.jsx)(t.p,{children:"Output:"}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{children:"+---------------+--------------+\n| trip_distance | total_amount |\n+---------------+--------------+\n| 312722.3      | 22.15        |\n| 97793.92      | 36.31        |\n| 82015.45      | 21.56        |\n| 72975.97      | 20.04        |\n| 71752.26      | 49.57        |\n| 59282.45      | 33.52        |\n| 59076.43      | 23.17        |\n| 58298.51      | 18.63        |\n| 51619.36      | 24.2         |\n| 44018.64      | 52.43        |\n+---------------+--------------+\n\nTime: 0.035694958 seconds. 10 rows.\n"})}),"\n",(0,r.jsx)(t.h2,{id:"next-steps",children:"Next Steps"}),"\n","\n",(0,r.jsx)(l.A,{items:[{type:"link",label:"Quickstarts",href:"https://github.com/spiceai/quickstarts",description:"Spice.ai Quickstart Tutorials."},{type:"link",label:"Samples",href:"https://github.com/spiceai/samples",description:"Dive deeper with in-depth samples."}]})]})}function m(e={}){const{wrapper:t}={...(0,s.R)(),...e.components};return t?(0,r.jsx)(t,{...e,children:(0,r.jsx)(h,{...e})}):h(e)}},3514:(e,t,n)=>{n.d(t,{A:()=>b});n(6540);var r=n(4164),s=n(4142),i=n(8774),a=n(5846),l=n(6654),c=n(1312),o=n(1107);const u={cardContainer:"cardContainer_fWXF",cardTitle:"cardTitle_rnsV",cardDescription:"cardDescription_PWke"};var d=n(4848);function p(e){let{href:t,children:n}=e;return(0,d.jsx)(i.A,{href:t,className:(0,r.A)("card padding--lg",u.cardContainer),children:n})}function h(e){let{href:t,icon:n,title:s,description:i}=e;return(0,d.jsxs)(p,{href:t,children:[(0,d.jsxs)(o.A,{as:"h2",className:(0,r.A)("text--truncate",u.cardTitle),title:s,children:[n," ",s]}),i&&(0,d.jsx)("p",{className:(0,r.A)("text--truncate",u.cardDescription),title:i,children:i})]})}function m(e){let{item:t}=e;const n=(0,s.Nr)(t),r=function(){const{selectMessage:e}=(0,a.W)();return t=>e(t,(0,c.T)({message:"{count} items",id:"theme.docs.DocCard.categoryDescription.plurals",description:"The default description for a category card in the generated index about how many items this category includes"},{count:t}))}();return n?(0,d.jsx)(h,{href:n,icon:"\ud83d\uddc3\ufe0f",title:t.label,description:t.description??r(t.items.length)}):null}function g(e){let{item:t}=e;const n=(0,l.A)(t.href)?"\ud83d\udcc4\ufe0f":"\ud83d\udd17",r=(0,s.cC)(t.docId??void 0);return(0,d.jsx)(h,{href:t.href,icon:n,title:t.label,description:t.description??r?.description})}function f(e){let{item:t}=e;switch(t.type){case"link":return(0,d.jsx)(g,{item:t});case"category":return(0,d.jsx)(m,{item:t});default:throw new Error(`unknown item type ${JSON.stringify(t)}`)}}function x(e){let{className:t}=e;const n=(0,s.$S)();return(0,d.jsx)(b,{items:n.items,className:t})}function b(e){const{items:t,className:n}=e;if(!t)return(0,d.jsx)(x,{...e});const i=(0,s.d1)(t);return(0,d.jsx)("section",{className:(0,r.A)("row",n),children:i.map(((e,t)=>(0,d.jsx)("article",{className:"col col--6 margin-bottom--lg",children:(0,d.jsx)(f,{item:e})},t)))})}},9365:(e,t,n)=>{n.d(t,{A:()=>a});n(6540);var r=n(4164);const s={tabItem:"tabItem_Ymn6"};var i=n(4848);function a(e){let{children:t,hidden:n,className:a}=e;return(0,i.jsx)("div",{role:"tabpanel",className:(0,r.A)(s.tabItem,a),hidden:n,children:t})}},1470:(e,t,n)=>{n.d(t,{A:()=>y});var r=n(6540),s=n(4164),i=n(3104),a=n(6347),l=n(205),c=n(7485),o=n(1682),u=n(9466);function d(e){return r.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,r.isValidElement)(e)&&function(e){const{props:t}=e;return!!t&&"object"==typeof t&&"value"in t}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function p(e){const{values:t,children:n}=e;return(0,r.useMemo)((()=>{const e=t??function(e){return d(e).map((e=>{let{props:{value:t,label:n,attributes:r,default:s}}=e;return{value:t,label:n,attributes:r,default:s}}))}(n);return function(e){const t=(0,o.X)(e,((e,t)=>e.value===t.value));if(t.length>0)throw new Error(`Docusaurus error: Duplicate values "${t.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[t,n])}function h(e){let{value:t,tabValues:n}=e;return n.some((e=>e.value===t))}function m(e){let{queryString:t=!1,groupId:n}=e;const s=(0,a.W6)(),i=function(e){let{queryString:t=!1,groupId:n}=e;if("string"==typeof t)return t;if(!1===t)return null;if(!0===t&&!n)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return n??null}({queryString:t,groupId:n});return[(0,c.aZ)(i),(0,r.useCallback)((e=>{if(!i)return;const t=new URLSearchParams(s.location.search);t.set(i,e),s.replace({...s.location,search:t.toString()})}),[i,s])]}function g(e){const{defaultValue:t,queryString:n=!1,groupId:s}=e,i=p(e),[a,c]=(0,r.useState)((()=>function(e){let{defaultValue:t,tabValues:n}=e;if(0===n.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(t){if(!h({value:t,tabValues:n}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${t}" but none of its children has the corresponding value. Available values are: ${n.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return t}const r=n.find((e=>e.default))??n[0];if(!r)throw new Error("Unexpected error: 0 tabValues");return r.value}({defaultValue:t,tabValues:i}))),[o,d]=m({queryString:n,groupId:s}),[g,f]=function(e){let{groupId:t}=e;const n=function(e){return e?`docusaurus.tab.${e}`:null}(t),[s,i]=(0,u.Dv)(n);return[s,(0,r.useCallback)((e=>{n&&i.set(e)}),[n,i])]}({groupId:s}),x=(()=>{const e=o??g;return h({value:e,tabValues:i})?e:null})();(0,l.A)((()=>{x&&c(x)}),[x]);return{selectedValue:a,selectValue:(0,r.useCallback)((e=>{if(!h({value:e,tabValues:i}))throw new Error(`Can't select invalid tab value=${e}`);c(e),d(e),f(e)}),[d,f,i]),tabValues:i}}var f=n(2303);const x={tabList:"tabList__CuJ",tabItem:"tabItem_LNqP"};var b=n(4848);function j(e){let{className:t,block:n,selectedValue:r,selectValue:a,tabValues:l}=e;const c=[],{blockElementScrollPositionUntilNextRender:o}=(0,i.a_)(),u=e=>{const t=e.currentTarget,n=c.indexOf(t),s=l[n].value;s!==r&&(o(t),a(s))},d=e=>{let t=null;switch(e.key){case"Enter":u(e);break;case"ArrowRight":{const n=c.indexOf(e.currentTarget)+1;t=c[n]??c[0];break}case"ArrowLeft":{const n=c.indexOf(e.currentTarget)-1;t=c[n]??c[c.length-1];break}}t?.focus()};return(0,b.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,s.A)("tabs",{"tabs--block":n},t),children:l.map((e=>{let{value:t,label:n,attributes:i}=e;return(0,b.jsx)("li",{role:"tab",tabIndex:r===t?0:-1,"aria-selected":r===t,ref:e=>c.push(e),onKeyDown:d,onClick:u,...i,className:(0,s.A)("tabs__item",x.tabItem,i?.className,{"tabs__item--active":r===t}),children:n??t},t)}))})}function w(e){let{lazy:t,children:n,selectedValue:s}=e;const i=(Array.isArray(n)?n:[n]).filter(Boolean);if(t){const e=i.find((e=>e.props.value===s));return e?(0,r.cloneElement)(e,{className:"margin-top--md"}):null}return(0,b.jsx)("div",{className:"margin-top--md",children:i.map(((e,t)=>(0,r.cloneElement)(e,{key:t,hidden:e.props.value!==s})))})}function v(e){const t=g(e);return(0,b.jsxs)("div",{className:(0,s.A)("tabs-container",x.tabList),children:[(0,b.jsx)(j,{...t,...e}),(0,b.jsx)(w,{...t,...e})]})}function y(e){const t=(0,f.A)();return(0,b.jsx)(v,{...e,children:d(e.children)},String(t))}},5846:(e,t,n)=>{n.d(t,{W:()=>o});var r=n(6540),s=n(4586);const i=["zero","one","two","few","many","other"];function a(e){return i.filter((t=>e.includes(t)))}const l={locale:"en",pluralForms:a(["one","other"]),select:e=>1===e?"one":"other"};function c(){const{i18n:{currentLocale:e}}=(0,s.A)();return(0,r.useMemo)((()=>{try{return function(e){const t=new Intl.PluralRules(e);return{locale:e,pluralForms:a(t.resolvedOptions().pluralCategories),select:e=>t.select(e)}}(e)}catch(t){return console.error(`Failed to use Intl.PluralRules for locale "${e}".\nDocusaurus will fallback to the default (English) implementation.\nError: ${t.message}\n`),l}}),[e])}function o(){const e=c();return{selectMessage:(t,n)=>function(e,t,n){const r=e.split("|");if(1===r.length)return r[0];r.length>n.pluralForms.length&&console.error(`For locale=${n.locale}, a maximum of ${n.pluralForms.length} plural forms are expected (${n.pluralForms.join(",")}), but the message contains ${r.length}: ${e}`);const s=n.select(t),i=n.pluralForms.indexOf(s);return r[Math.min(i,r.length-1)]}(n,t,e)}}},8453:(e,t,n)=>{n.d(t,{R:()=>a,x:()=>l});var r=n(6540);const s={},i=r.createContext(s);function a(e){const t=r.useContext(i);return r.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function l(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:a(e.components),r.createElement(i.Provider,{value:t},e.children)}}}]);
"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[6605],{6274:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>u,contentTitle:()=>o,default:()=>m,frontMatter:()=>i,metadata:()=>c,toc:()=>d});var r=t(4848),a=t(8453),s=t(1470),l=t(9365);const i={title:"POST /v1/predict",sidebar_label:"POST /v1/predict",description:"",sidebar_position:10},o=void 0,c={id:"api/http/ml-predict",title:"POST /v1/predict",description:"",source:"@site/docs/api/http/ml-predict.md",sourceDirName:"api/http",slug:"/api/http/ml-predict",permalink:"/api/http/ml-predict",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/api/http/ml-predict.md",tags:[],version:"current",sidebarPosition:10,frontMatter:{title:"POST /v1/predict",sidebar_label:"POST /v1/predict",description:"",sidebar_position:10},sidebar:"docsSidebar",previous:{title:"POST /v1/embeddings",permalink:"/api/http/embeddings"},next:{title:"ADBC",permalink:"/api/adbc/"}},u={},d=[{value:"GET <code>/v1/models/:name/predict</code>",id:"get-v1modelsnamepredict",level:2},{value:"Response",id:"response",level:3}];function p(e){const n={a:"a",admonition:"admonition",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",ul:"ul",...(0,a.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.p,{children:"Make predictions using all loaded forecasting models in parallel, useful for ensembling or A/B testing."}),"\n",(0,r.jsx)(n.p,{children:"Example:"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-shell",children:'curl --request POST \\\n  --url http://localhost:8090/v1/predict \\\n  --data \'{\n    "predictions": [\n        {\n            "model_name": "drive_stats_a"\n        },\n        {\n            "model_name": "drive_stats_b"\n        }\n    ]\n}\'\n'})}),"\n",(0,r.jsx)(n.p,{children:"Parameters:"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"model_name"}),": References a model name defined in the ",(0,r.jsx)(n.code,{children:"spicepod.yaml"}),"."]}),"\n"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-json",children:'{\n  "duration_ms": 81,\n  "predictions": [\n    {\n      "status": "Success",\n      "model_name": "drive_stats_a",\n      "model_version": "1.0",\n      "lookback": 30,\n      "prediction": [0.45, 0.5, 0.55],\n      "duration_ms": 42\n    },\n    {\n      "status": "Success",\n      "model_name": "drive_stats_b",\n      "model_version": "1.0",\n      "lookback": 30,\n      "prediction": [0.43, 0.51, 0.53],\n      "duration_ms": 42\n    }\n  ]\n}\n'})}),"\n",(0,r.jsx)(n.admonition,{title:"Limitations",type:"warning",children:(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsx)(n.li,{children:"Univariate predictions only."}),"\n",(0,r.jsx)(n.li,{children:"Multiple covariates."}),"\n",(0,r.jsx)(n.li,{children:"Covariate and output variate must have a fixed time frequency."}),"\n",(0,r.jsx)(n.li,{children:"No support for discrete or exogenous variables."}),"\n"]})}),"\n",(0,r.jsxs)(n.h2,{id:"get-v1modelsnamepredict",children:["GET ",(0,r.jsx)(n.code,{children:"/v1/models/:name/predict"})]}),"\n",(0,r.jsxs)(n.p,{children:["Make a prediction using a specific ",(0,r.jsx)(n.a,{href:"/components/models/",children:"model"}),"."]}),"\n",(0,r.jsx)(n.p,{children:"Example:"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-shell",children:'curl "http://localhost:8090/v1/models/my_model_name/predict"\n'})}),"\n",(0,r.jsx)(n.p,{children:"Parameters:"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"name"}),": References the model name defined in the ",(0,r.jsx)(n.code,{children:"spicepod.yaml"}),"."]}),"\n"]}),"\n",(0,r.jsx)(n.h3,{id:"response",children:"Response"}),"\n",(0,r.jsxs)(s.A,{children:[(0,r.jsx)(l.A,{value:"Success",label:"Success",default:!0,children:(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-json",children:'{\n    "status": "Success",\n    "model_name": "my_model_name",\n    "model_version": "1.0",\n    "lookback": 30,\n    "prediction": [0.45, 0.50, 0.55],\n    "duration_ms": 123\n}\n'})})}),(0,r.jsx)(l.A,{value:"Bad Request",label:"Bad Request",children:(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-json",children:'{\n    "status": "BadRequest",\n    "error_message": "You have me a bad request :(",\n    "model_name": "my_model_name",\n    "lookback": 30,\n    "duration_ms": 12\n}\n'})})}),(0,r.jsx)(l.A,{value:"Internal Error",label:"Internal Error",children:(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-json",children:'{\n    "status": "InternalError",\n    "error_message": "Oops, the server couldn\'t predict",\n    "model_name": "my_model_name",\n    "lookback": 30,\n    "duration_ms": 12\n}\n'})})})]})]})}function m(e={}){const{wrapper:n}={...(0,a.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(p,{...e})}):p(e)}},9365:(e,n,t)=>{t.d(n,{A:()=>l});t(6540);var r=t(4164);const a={tabItem:"tabItem_Ymn6"};var s=t(4848);function l(e){let{children:n,hidden:t,className:l}=e;return(0,s.jsx)("div",{role:"tabpanel",className:(0,r.A)(a.tabItem,l),hidden:t,children:n})}},1470:(e,n,t)=>{t.d(n,{A:()=>y});var r=t(6540),a=t(4164),s=t(3104),l=t(6347),i=t(205),o=t(7485),c=t(1682),u=t(679);function d(e){return r.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,r.isValidElement)(e)&&function(e){const{props:n}=e;return!!n&&"object"==typeof n&&"value"in n}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function p(e){const{values:n,children:t}=e;return(0,r.useMemo)((()=>{const e=n??function(e){return d(e).map((e=>{let{props:{value:n,label:t,attributes:r,default:a}}=e;return{value:n,label:t,attributes:r,default:a}}))}(t);return function(e){const n=(0,c.X)(e,((e,n)=>e.value===n.value));if(n.length>0)throw new Error(`Docusaurus error: Duplicate values "${n.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[n,t])}function m(e){let{value:n,tabValues:t}=e;return t.some((e=>e.value===n))}function h(e){let{queryString:n=!1,groupId:t}=e;const a=(0,l.W6)(),s=function(e){let{queryString:n=!1,groupId:t}=e;if("string"==typeof n)return n;if(!1===n)return null;if(!0===n&&!t)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return t??null}({queryString:n,groupId:t});return[(0,o.aZ)(s),(0,r.useCallback)((e=>{if(!s)return;const n=new URLSearchParams(a.location.search);n.set(s,e),a.replace({...a.location,search:n.toString()})}),[s,a])]}function b(e){const{defaultValue:n,queryString:t=!1,groupId:a}=e,s=p(e),[l,o]=(0,r.useState)((()=>function(e){let{defaultValue:n,tabValues:t}=e;if(0===t.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(n){if(!m({value:n,tabValues:t}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${n}" but none of its children has the corresponding value. Available values are: ${t.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return n}const r=t.find((e=>e.default))??t[0];if(!r)throw new Error("Unexpected error: 0 tabValues");return r.value}({defaultValue:n,tabValues:s}))),[c,d]=h({queryString:t,groupId:a}),[b,f]=function(e){let{groupId:n}=e;const t=function(e){return e?`docusaurus.tab.${e}`:null}(n),[a,s]=(0,u.Dv)(t);return[a,(0,r.useCallback)((e=>{t&&s.set(e)}),[t,s])]}({groupId:a}),v=(()=>{const e=c??b;return m({value:e,tabValues:s})?e:null})();(0,i.A)((()=>{v&&o(v)}),[v]);return{selectedValue:l,selectValue:(0,r.useCallback)((e=>{if(!m({value:e,tabValues:s}))throw new Error(`Can't select invalid tab value=${e}`);o(e),d(e),f(e)}),[d,f,s]),tabValues:s}}var f=t(2303);const v={tabList:"tabList__CuJ",tabItem:"tabItem_LNqP"};var x=t(4848);function g(e){let{className:n,block:t,selectedValue:r,selectValue:l,tabValues:i}=e;const o=[],{blockElementScrollPositionUntilNextRender:c}=(0,s.a_)(),u=e=>{const n=e.currentTarget,t=o.indexOf(n),a=i[t].value;a!==r&&(c(n),l(a))},d=e=>{let n=null;switch(e.key){case"Enter":u(e);break;case"ArrowRight":{const t=o.indexOf(e.currentTarget)+1;n=o[t]??o[0];break}case"ArrowLeft":{const t=o.indexOf(e.currentTarget)-1;n=o[t]??o[o.length-1];break}}n?.focus()};return(0,x.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,a.A)("tabs",{"tabs--block":t},n),children:i.map((e=>{let{value:n,label:t,attributes:s}=e;return(0,x.jsx)("li",{role:"tab",tabIndex:r===n?0:-1,"aria-selected":r===n,ref:e=>o.push(e),onKeyDown:d,onClick:u,...s,className:(0,a.A)("tabs__item",v.tabItem,s?.className,{"tabs__item--active":r===n}),children:t??n},n)}))})}function j(e){let{lazy:n,children:t,selectedValue:a}=e;const s=(Array.isArray(t)?t:[t]).filter(Boolean);if(n){const e=s.find((e=>e.props.value===a));return e?(0,r.cloneElement)(e,{className:"margin-top--md"}):null}return(0,x.jsx)("div",{className:"margin-top--md",children:s.map(((e,n)=>(0,r.cloneElement)(e,{key:n,hidden:e.props.value!==a})))})}function _(e){const n=b(e);return(0,x.jsxs)("div",{className:(0,a.A)("tabs-container",v.tabList),children:[(0,x.jsx)(g,{...n,...e}),(0,x.jsx)(j,{...n,...e})]})}function y(e){const n=(0,f.A)();return(0,x.jsx)(_,{...e,children:d(e.children)},String(n))}},8453:(e,n,t)=>{t.d(n,{R:()=>l,x:()=>i});var r=t(6540);const a={},s=r.createContext(a);function l(e){const n=r.useContext(s);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function i(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:l(e.components),r.createElement(s.Provider,{value:n},e.children)}}}]);
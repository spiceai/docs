"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[1958],{4498:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>i,contentTitle:()=>o,default:()=>u,frontMatter:()=>s,metadata:()=>l,toc:()=>c});var n=r(4848),a=r(8453);r(1470),r(9365);const s={title:"File Data Connector",sidebar_label:"File Data Connector",description:"File Data Connector Documentation"},o=void 0,l={id:"components/data-connectors/file",title:"File Data Connector",description:"File Data Connector Documentation",source:"@site/docs/components/data-connectors/file.md",sourceDirName:"components/data-connectors",slug:"/components/data-connectors/file",permalink:"/components/data-connectors/file",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/components/data-connectors/file.md",tags:[],version:"current",frontMatter:{title:"File Data Connector",sidebar_label:"File Data Connector",description:"File Data Connector Documentation"},sidebar:"docsSidebar",previous:{title:"DuckDB Data Connector",permalink:"/components/data-connectors/duckdb"},next:{title:"Flight SQL Data Connector",permalink:"/components/data-connectors/flightsql"}},i={},c=[{value:"Parameters",id:"parameters",level:2},{value:"Trigger data refresh on file change",id:"trigger-data-refresh-on-file-change",level:2}];function d(e){const t={a:"a",code:"code",h2:"h2",p:"p",pre:"pre",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,a.R)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(t.p,{children:"The File Data Connector enables federated SQL queries on files stored by locally accessible filesystems. It supports querying individual files or entire directories, where all child files within the directory will be loaded and queried."}),"\n",(0,n.jsxs)(t.p,{children:["File formats are specified using the ",(0,n.jsx)(t.code,{children:"file_format"})," parameter, as described in ",(0,n.jsx)(t.a,{href:"/components/data-connectors/#object-store-file-formats",children:"Object Store File Formats"}),"."]}),"\n",(0,n.jsxs)(t.p,{children:["Example ",(0,n.jsx)(t.code,{children:"spicepod.yml"})]}),"\n",(0,n.jsx)(t.pre,{children:(0,n.jsx)(t.code,{className:"language-yaml",children:"datasets:\n  - from: file://path/to/customer.parquet\n    name: customer\n    params:\n      file_format: parquet\n\n  - from: file://path/to/orders.csv\n    name: orders\n    params:\n      file_format: csv\n      csv_has_header: false\n"})}),"\n",(0,n.jsx)(t.h2,{id:"parameters",children:"Parameters"}),"\n",(0,n.jsxs)(t.table,{children:[(0,n.jsx)(t.thead,{children:(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.th,{children:"Parameter name"}),(0,n.jsx)(t.th,{children:"Description"})]})}),(0,n.jsxs)(t.tbody,{children:[(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:(0,n.jsx)(t.code,{children:"file_format"})}),(0,n.jsxs)(t.td,{children:["Specifies the data file format. Required if the format cannot be inferred from the ",(0,n.jsx)(t.code,{children:"from"})," path."]})]}),(0,n.jsxs)(t.tr,{children:[(0,n.jsx)(t.td,{children:(0,n.jsx)(t.code,{children:"hive_infer_partitions"})}),(0,n.jsx)(t.td,{children:"Infer the partition columns for hive-style partitioning from the folder structure. Defaults to true."})]})]})]}),"\n",(0,n.jsxs)(t.p,{children:["For CSV-specific parameters, see ",(0,n.jsx)(t.a,{href:"/reference/file_format#csv",children:"CSV Parameters"}),"."]}),"\n",(0,n.jsx)(t.h2,{id:"trigger-data-refresh-on-file-change",children:"Trigger data refresh on file change"}),"\n",(0,n.jsxs)(t.p,{children:["In addition to standard ",(0,n.jsx)(t.a,{href:"/components/data-accelerators/data-refresh",children:"Data Refresh"}),", a data refresh can also be triggered when the source file is modified. The File Data Connector uses a file system watcher to be notified the file has changed. The file watcher is disabled by default and can be enabled by setting the ",(0,n.jsx)(t.code,{children:"file_watcher"})," parameter to ",(0,n.jsx)(t.code,{children:"enabled"})," in the acceleration parameters."]}),"\n",(0,n.jsx)(t.pre,{children:(0,n.jsx)(t.code,{className:"language-yaml",children:"datasets:\n  - from: file://path/to/my_file.csv\n    name: my_file\n    acceleration:\n      enabled: true\n      refresh_mode: full\n      params:\n        file_watcher: enabled\n"})}),"\n",(0,n.jsx)(t.p,{children:"When the file is modified, the acceleration will be refreshed and will include the latest data."})]})}function u(e={}){const{wrapper:t}={...(0,a.R)(),...e.components};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(d,{...e})}):d(e)}},9365:(e,t,r)=>{r.d(t,{A:()=>o});r(6540);var n=r(4164);const a={tabItem:"tabItem_Ymn6"};var s=r(4848);function o(e){let{children:t,hidden:r,className:o}=e;return(0,s.jsx)("div",{role:"tabpanel",className:(0,n.A)(a.tabItem,o),hidden:r,children:t})}},1470:(e,t,r)=>{r.d(t,{A:()=>w});var n=r(6540),a=r(4164),s=r(3104),o=r(6347),l=r(205),i=r(7485),c=r(1682),d=r(679);function u(e){return n.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,n.isValidElement)(e)&&function(e){const{props:t}=e;return!!t&&"object"==typeof t&&"value"in t}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function h(e){const{values:t,children:r}=e;return(0,n.useMemo)((()=>{const e=t??function(e){return u(e).map((e=>{let{props:{value:t,label:r,attributes:n,default:a}}=e;return{value:t,label:r,attributes:n,default:a}}))}(r);return function(e){const t=(0,c.XI)(e,((e,t)=>e.value===t.value));if(t.length>0)throw new Error(`Docusaurus error: Duplicate values "${t.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[t,r])}function f(e){let{value:t,tabValues:r}=e;return r.some((e=>e.value===t))}function m(e){let{queryString:t=!1,groupId:r}=e;const a=(0,o.W6)(),s=function(e){let{queryString:t=!1,groupId:r}=e;if("string"==typeof t)return t;if(!1===t)return null;if(!0===t&&!r)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return r??null}({queryString:t,groupId:r});return[(0,i.aZ)(s),(0,n.useCallback)((e=>{if(!s)return;const t=new URLSearchParams(a.location.search);t.set(s,e),a.replace({...a.location,search:t.toString()})}),[s,a])]}function p(e){const{defaultValue:t,queryString:r=!1,groupId:a}=e,s=h(e),[o,i]=(0,n.useState)((()=>function(e){let{defaultValue:t,tabValues:r}=e;if(0===r.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(t){if(!f({value:t,tabValues:r}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${t}" but none of its children has the corresponding value. Available values are: ${r.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return t}const n=r.find((e=>e.default))??r[0];if(!n)throw new Error("Unexpected error: 0 tabValues");return n.value}({defaultValue:t,tabValues:s}))),[c,u]=m({queryString:r,groupId:a}),[p,b]=function(e){let{groupId:t}=e;const r=function(e){return e?`docusaurus.tab.${e}`:null}(t),[a,s]=(0,d.Dv)(r);return[a,(0,n.useCallback)((e=>{r&&s.set(e)}),[r,s])]}({groupId:a}),v=(()=>{const e=c??p;return f({value:e,tabValues:s})?e:null})();(0,l.A)((()=>{v&&i(v)}),[v]);return{selectedValue:o,selectValue:(0,n.useCallback)((e=>{if(!f({value:e,tabValues:s}))throw new Error(`Can't select invalid tab value=${e}`);i(e),u(e),b(e)}),[u,b,s]),tabValues:s}}var b=r(2303);const v={tabList:"tabList__CuJ",tabItem:"tabItem_LNqP"};var g=r(4848);function x(e){let{className:t,block:r,selectedValue:n,selectValue:o,tabValues:l}=e;const i=[],{blockElementScrollPositionUntilNextRender:c}=(0,s.a_)(),d=e=>{const t=e.currentTarget,r=i.indexOf(t),a=l[r].value;a!==n&&(c(t),o(a))},u=e=>{let t=null;switch(e.key){case"Enter":d(e);break;case"ArrowRight":{const r=i.indexOf(e.currentTarget)+1;t=i[r]??i[0];break}case"ArrowLeft":{const r=i.indexOf(e.currentTarget)-1;t=i[r]??i[i.length-1];break}}t?.focus()};return(0,g.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,a.A)("tabs",{"tabs--block":r},t),children:l.map((e=>{let{value:t,label:r,attributes:s}=e;return(0,g.jsx)("li",{role:"tab",tabIndex:n===t?0:-1,"aria-selected":n===t,ref:e=>i.push(e),onKeyDown:u,onClick:d,...s,className:(0,a.A)("tabs__item",v.tabItem,s?.className,{"tabs__item--active":n===t}),children:r??t},t)}))})}function j(e){let{lazy:t,children:r,selectedValue:s}=e;const o=(Array.isArray(r)?r:[r]).filter(Boolean);if(t){const e=o.find((e=>e.props.value===s));return e?(0,n.cloneElement)(e,{className:(0,a.A)("margin-top--md",e.props.className)}):null}return(0,g.jsx)("div",{className:"margin-top--md",children:o.map(((e,t)=>(0,n.cloneElement)(e,{key:t,hidden:e.props.value!==s})))})}function y(e){const t=p(e);return(0,g.jsxs)("div",{className:(0,a.A)("tabs-container",v.tabList),children:[(0,g.jsx)(x,{...t,...e}),(0,g.jsx)(j,{...t,...e})]})}function w(e){const t=(0,b.A)();return(0,g.jsx)(y,{...e,children:u(e.children)},String(t))}},8453:(e,t,r)=>{r.d(t,{R:()=>o,x:()=>l});var n=r(6540);const a={},s=n.createContext(a);function o(e){const t=n.useContext(s);return n.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function l(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:o(e.components),n.createElement(s.Provider,{value:t},e.children)}}}]);
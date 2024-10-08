"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[4726],{2085:(e,n,o)=>{o.r(n),o.d(n,{assets:()=>c,contentTitle:()=>d,default:()=>p,frontMatter:()=>i,metadata:()=>r,toc:()=>a});var t=o(4848),s=o(8453);const i={title:"OpenAI (or Compatible) Language Models",sidebar_label:"OpenAI",sidebar_position:4},d=void 0,r={id:"components/models/openai",title:"OpenAI (or Compatible) Language Models",description:"To use a language model hosted on OpenAI (or compatible), specify the openai path in from.",source:"@site/docs/components/models/openai.md",sourceDirName:"components/models",slug:"/components/models/openai",permalink:"/components/models/openai",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/components/models/openai.md",tags:[],version:"current",sidebarPosition:4,frontMatter:{title:"OpenAI (or Compatible) Language Models",sidebar_label:"OpenAI",sidebar_position:4},sidebar:"docsSidebar",previous:{title:"Filesystem",permalink:"/components/models/filesystem"},next:{title:"Views",permalink:"/components/views/"}},c={},a=[];function l(e){const n={code:"code",p:"p",pre:"pre",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,s.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(n.p,{children:["To use a language model hosted on OpenAI (or compatible), specify the ",(0,t.jsx)(n.code,{children:"openai"})," path in ",(0,t.jsx)(n.code,{children:"from"}),"."]}),"\n",(0,t.jsxs)(n.p,{children:["For a specific model, include it as the model ID in ",(0,t.jsx)(n.code,{children:"from"})," (see example below). Defaults to ",(0,t.jsx)(n.code,{children:'"gpt-3.5-turbo"'}),".\nThese parameters are specific to OpenAI models:"]}),"\n",(0,t.jsxs)(n.table,{children:[(0,t.jsx)(n.thead,{children:(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.th,{children:"Param"}),(0,t.jsx)(n.th,{children:"Description"}),(0,t.jsx)(n.th,{children:"Default"})]})}),(0,t.jsxs)(n.tbody,{children:[(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"openai_api_key"})}),(0,t.jsx)(n.td,{children:"The OpenAI API key."}),(0,t.jsx)(n.td,{children:"-"})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"openai_org_id"})}),(0,t.jsx)(n.td,{children:"The OpenAI organization id."}),(0,t.jsx)(n.td,{children:"-"})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"openai_project_id"})}),(0,t.jsx)(n.td,{children:"The OpenAI project id."}),(0,t.jsx)(n.td,{children:"-"})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"endpoint"})}),(0,t.jsx)(n.td,{children:"The OpenAI API base endpoint."}),(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"https://api.openai.com/v1"})})]})]})]}),"\n",(0,t.jsx)(n.p,{children:"Example:"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-yaml",children:"models:\n  - from: openai:gpt-4o\n    name: local_fs_model\n    params:\n      openai_api_key: ${ secrets:SPICE_OPENAI_API_KEY }\n\n  - from: openai:llama3-groq-70b-8192-tool-use-preview\n    name: groq-llama\n    params:\n      endpoint: https://api.groq.com/openai/v1\n      openai_api_key: ${ secrets:SPICE_GROQ_API_KEY }\n"})})]})}function p(e={}){const{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(l,{...e})}):l(e)}},8453:(e,n,o)=>{o.d(n,{R:()=>d,x:()=>r});var t=o(6540);const s={},i=t.createContext(s);function d(e){const n=t.useContext(i);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function r(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:d(e.components),t.createElement(i.Provider,{value:n},e.children)}}}]);
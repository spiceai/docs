"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[7923],{9985:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>r,contentTitle:()=>a,default:()=>u,frontMatter:()=>l,metadata:()=>c,toc:()=>o});var t=s(4848),i=s(8453);const l={title:"sql",sidebar_label:"sql",pagination_prev:null,pagination_next:null},a=void 0,c={id:"cli/reference/sql",title:"sql",description:"Start an interactive SQL query session against the Spice runtime",source:"@site/docs/cli/reference/sql.md",sourceDirName:"cli/reference",slug:"/cli/reference/sql",permalink:"/cli/reference/sql",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/cli/reference/sql.md",tags:[],version:"current",frontMatter:{title:"sql",sidebar_label:"sql",pagination_prev:null,pagination_next:null},sidebar:"tutorialSidebar"},r={},o=[{value:"Usage:",id:"usage",level:3},{value:"Flags:",id:"flags",level:4},{value:"Examples",id:"examples",level:3}];function d(e){const n={code:"code",h3:"h3",h4:"h4",li:"li",p:"p",pre:"pre",ul:"ul",...(0,i.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.p,{children:"Start an interactive SQL query session against the Spice runtime"}),"\n",(0,t.jsx)(n.h3,{id:"usage",children:"Usage:"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-shell",children:"spice sql [flags]\n"})}),"\n",(0,t.jsx)(n.h4,{id:"flags",children:"Flags:"}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"-h"}),", ",(0,t.jsx)(n.code,{children:"--help"}),"   Print this help message"]}),"\n"]}),"\n",(0,t.jsx)(n.h3,{id:"examples",children:"Examples"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-shell",children:"$ spice sql\nWelcome to the interactive Spice.ai SQL Query Utility! Type 'help' for help.\n\nshow tables;  -- list available tables\nsql> show tables\n+---------------+--------------------+---------------+------------+\n| table_catalog | table_schema       | table_name    | table_type |\n+---------------+--------------------+---------------+------------+\n| datafusion    | public             | tmp_view_test | VIEW       |\n| datafusion    | information_schema | tables        | VIEW       |\n| datafusion    | information_schema | views         | VIEW       |\n| datafusion    | information_schema | columns       | VIEW       |\n| datafusion    | information_schema | df_settings   | VIEW       |\n+---------------+--------------------+---------------+------------+\n"})})]})}function u(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(d,{...e})}):d(e)}},8453:(e,n,s)=>{s.d(n,{R:()=>a,x:()=>c});var t=s(6540);const i={},l=t.createContext(i);function a(e){const n=t.useContext(l);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:a(e.components),t.createElement(l.Provider,{value:n},e.children)}}}]);
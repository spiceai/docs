"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[9976],{6535:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>l,contentTitle:()=>r,default:()=>h,frontMatter:()=>d,metadata:()=>c,toc:()=>a});var t=i(4848),s=i(8453);const d={title:"Spice.ai OSS CLI documentation",sidebar_label:"CLI",description:"Detailed documentation on the Spice.ai OSS CLI",sidebar_position:9,pagination_prev:null},r=void 0,c={id:"cli/index",title:"Spice.ai OSS CLI documentation",description:"Detailed documentation on the Spice.ai OSS CLI",source:"@site/docs/cli/index.md",sourceDirName:"cli",slug:"/cli/",permalink:"/cli/",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/cli/index.md",tags:[],version:"current",sidebarPosition:9,frontMatter:{title:"Spice.ai OSS CLI documentation",sidebar_label:"CLI",description:"Detailed documentation on the Spice.ai OSS CLI",sidebar_position:9,pagination_prev:null},sidebar:"tutorialSidebar",next:{title:"Spice CLI command reference",permalink:"/cli/reference/"}},l={},a=[{value:"Install",id:"install",level:2},{value:"Getting started",id:"getting-started",level:2},{value:"Updating",id:"updating",level:2},{value:"Uninstall",id:"uninstall",level:2}];function o(e){const n={a:"a",admonition:"admonition",code:"code",h2:"h2",li:"li",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,s.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.p,{children:"The Spice CLI is a set of commands to create and manage Spicepods and interact with the Spice runtime."}),"\n",(0,t.jsx)(n.h2,{id:"install",children:"Install"}),"\n",(0,t.jsx)(n.p,{children:"The Spice CLI can be installed by:"}),"\n",(0,t.jsxs)(n.ul,{children:["\n",(0,t.jsxs)(n.li,{children:["Running ",(0,t.jsx)(n.code,{children:"curl https://install.spiceai.org | /bin/bash"})]}),"\n",(0,t.jsxs)(n.li,{children:["Downloading the binary from ",(0,t.jsx)(n.a,{href:"https://github.com/spiceai/spiceai/releases",children:"GitHub Releases"})]}),"\n"]}),"\n",(0,t.jsxs)(n.p,{children:["The ",(0,t.jsx)(n.code,{children:"spice"})," program will be added to the PATH automatically for ",(0,t.jsx)(n.strong,{children:"bash"}),", ",(0,t.jsx)(n.strong,{children:"fish"}),", and ",(0,t.jsx)(n.strong,{children:"zsh"})," shells."]}),"\n",(0,t.jsxs)(n.p,{children:["After installing the Spice CLI for the first time, ensure you've got the correct version by running ",(0,t.jsx)(n.code,{children:"spice version"}),". The Runtime version is not expected to be shown, as the runtime will be downloaded and installed automatically upon first run."]}),"\n",(0,t.jsx)(n.h2,{id:"getting-started",children:"Getting started"}),"\n",(0,t.jsxs)(n.p,{children:["For getting started with Spice using the Spice CLI, see the ",(0,t.jsx)(n.a,{href:"/getting-started",children:"Getting Started Guide"}),"."]}),"\n",(0,t.jsxs)(n.p,{children:["Use ",(0,t.jsx)(n.code,{children:"spice help"})," for all commands and ",(0,t.jsx)(n.code,{children:"spice [command] --help"})," for more information about a command."]}),"\n",(0,t.jsx)(n.p,{children:"A typical command-line workflow might be as follows:"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-bash",children:"# Start the runtime\nspice run\n"})}),"\n",(0,t.jsx)(n.p,{children:"Run new shell in the same folder:"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-bash",children:"# Init new app\nspice init spice_app\n\n# Add the Quickstart Spicepod\nspice add spiceai/quickstart\n\n"})}),"\n",(0,t.jsx)(n.p,{children:"Common commands are:"}),"\n",(0,t.jsxs)(n.table,{children:[(0,t.jsx)(n.thead,{children:(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.th,{children:"Command"}),(0,t.jsx)(n.th,{children:"Description"})]})}),(0,t.jsxs)(n.tbody,{children:[(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:"spice add"}),(0,t.jsx)(n.td,{children:"Add Pod - adds a pod to the project"})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:"spice run"}),(0,t.jsx)(n.td,{children:"Run Spice - starts the Spice runtime, installing if necessary"})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:"spice version"}),(0,t.jsx)(n.td,{children:"Spice CLI version"})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:"spice help"}),(0,t.jsx)(n.td,{children:"Help about any command"})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:"spice upgrade"}),(0,t.jsx)(n.td,{children:"Upgrades the Spice CLI to the latest release"})]})]})]}),"\n",(0,t.jsxs)(n.p,{children:["See ",(0,t.jsx)(n.a,{href:"/cli/reference",children:"Spice CLI command reference"})," for the full list of available commands."]}),"\n",(0,t.jsx)(n.h2,{id:"updating",children:"Updating"}),"\n",(0,t.jsx)(n.p,{children:"To update to latest CLI, run the upgrade command."}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-bash",children:"spice upgrade\n"})}),"\n",(0,t.jsx)(n.admonition,{type:"note",children:(0,t.jsxs)(n.p,{children:["Upgrade command is supported from CLI v0.3.1. For version < 0.3.1 users have to re-run the ",(0,t.jsx)(n.a,{href:"/cli#install",children:"install"})," script."]})}),"\n",(0,t.jsx)(n.h2,{id:"uninstall",children:"Uninstall"}),"\n",(0,t.jsxs)(n.p,{children:["The Spice CLI is installed by default to ",(0,t.jsx)(n.code,{children:"$HOME/.spice/bin/spice"})," and a line added to the shell config, such as ",(0,t.jsx)(n.code,{children:".zshrc"})]}),"\n",(0,t.jsxs)(n.p,{children:["It can be uninstalled by deleting the ",(0,t.jsx)(n.code,{children:"spice"})," binary and removing the PATH addition from the rc file."]})]})}function h(e={}){const{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(o,{...e})}):o(e)}},8453:(e,n,i)=>{i.d(n,{R:()=>r,x:()=>c});var t=i(6540);const s={},d=t.createContext(s);function r(e){const n=t.useContext(d);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:r(e.components),t.createElement(d.Provider,{value:n},e.children)}}}]);
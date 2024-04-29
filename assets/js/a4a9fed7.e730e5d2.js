"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[582],{9789:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>a,contentTitle:()=>r,default:()=>d,frontMatter:()=>c,metadata:()=>o,toc:()=>l});var s=i(4848),t=i(8453);const c={title:"Go SDK",description:"Connect to spice using spice go SDK",pagination_prev:null,pagination_next:null},r="Golang SDK for Spice.ai",o={id:"sdks/golang/index",title:"Go SDK",description:"Connect to spice using spice go SDK",source:"@site/docs/sdks/golang/index.md",sourceDirName:"sdks/golang",slug:"/sdks/golang/",permalink:"/sdks/golang/",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/sdks/golang/index.md",tags:[],version:"current",frontMatter:{title:"Go SDK",description:"Connect to spice using spice go SDK",pagination_prev:null,pagination_next:null},sidebar:"docsSidebar"},a={},l=[{value:"Install",id:"install",level:3},{value:"Connect to spice runtime",id:"connect-to-spice-runtime",level:3}];function p(e){const n={a:"a",code:"code",h1:"h1",h3:"h3",p:"p",pre:"pre",...(0,t.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.h1,{id:"golang-sdk-for-spiceai",children:"Golang SDK for Spice.ai"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.a,{href:"https://github.com/spiceai/gospice",children:"https://github.com/spiceai/gospice"})}),"\n",(0,s.jsx)(n.h3,{id:"install",children:"Install"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-shell",children:"go get github.com/spiceai/gospice/v6\n"})}),"\n",(0,s.jsx)(n.h3,{id:"connect-to-spice-runtime",children:"Connect to spice runtime"}),"\n",(0,s.jsx)(n.p,{children:"Import the package:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-go",children:'import "github.com/spiceai/gospice/v6"\n'})}),"\n",(0,s.jsxs)(n.p,{children:["Create a ",(0,s.jsx)(n.code,{children:"SpiceClient"})," using default configuration:"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-go",children:"spice := NewSpiceClient()\ndefer spice.Close()\n"})}),"\n",(0,s.jsx)(n.p,{children:"Or pass custom flight address:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-go",children:'if err := spice.Init(\n    spice.WithFlightAddress("grpc://my_remote_spice_instance:50051")\n); err != nil {\n    panic(fmt.Errorf("error initializing SpiceClient: %w", err))\n}\n'})}),"\n",(0,s.jsx)(n.p,{children:"Execute a query and get back an Apache Arrow Reader:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-go",children:'reader, err := spice.Query(\n  context.Background(),\n  "SELECT trip_distance, total_amount FROM taxi_trips ORDER BY trip_distance DESC LIMIT 10;"\n)\nif err != nil {\n    panic(fmt.Errorf("error querying: %w", err))\n}\ndefer reader.Release()\n'})})]})}function d(e={}){const{wrapper:n}={...(0,t.R)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(p,{...e})}):p(e)}},8453:(e,n,i)=>{i.d(n,{R:()=>r,x:()=>o});var s=i(6540);const t={},c=s.createContext(t);function r(e){const n=s.useContext(c);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:r(e.components),s.createElement(c.Provider,{value:n},e.children)}}}]);
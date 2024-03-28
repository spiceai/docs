"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[3244],{5784:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>o,contentTitle:()=>l,default:()=>h,frontMatter:()=>a,metadata:()=>r,toc:()=>c});var i=t(4848),s=t(8453);const a={title:"Tableau",sidebar_label:"Tableau",sidebar_position:10,description:"Use Tableau to to access, visualise and analyse datasets loaded in Spice."},l=void 0,r={id:"clients/tableau/index",title:"Tableau",description:"Use Tableau to to access, visualise and analyse datasets loaded in Spice.",source:"@site/docs/clients/tableau/index.md",sourceDirName:"clients/tableau",slug:"/clients/tableau/",permalink:"/clients/tableau/",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/clients/tableau/index.md",tags:[],version:"current",sidebarPosition:10,frontMatter:{title:"Tableau",sidebar_label:"Tableau",sidebar_position:10,description:"Use Tableau to to access, visualise and analyse datasets loaded in Spice."},sidebar:"tutorialSidebar",previous:{title:"Apache Superset",permalink:"/clients/superset/"},next:{title:"HTTP",permalink:"/clients/http_api/"}},o={},c=[{value:"Install Tableau Desktop",id:"install-tableau-desktop",level:2},{value:"Download and install the Flight SQL JDBC driver",id:"download-and-install-the-flight-sql-jdbc-driver",level:2},{value:"Configure a Spice connection",id:"configure-a-spice-connection",level:2},{value:"Working with Spice datasets",id:"working-with-spice-datasets",level:2}];function d(e){const n={a:"a",admonition:"admonition",blockquote:"blockquote",code:"code",h2:"h2",li:"li",ol:"ol",p:"p",strong:"strong",ul:"ul",...(0,s.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsxs)(n.p,{children:["Use ",(0,i.jsx)(n.a,{href:"https://www.tableau.com/",children:"Tableau"})," to access, visualise and analyse datasets loaded in Spice."]}),"\n",(0,i.jsxs)(n.blockquote,{children:["\n",(0,i.jsx)(n.p,{children:"The world's leading analytics platform. Tableau is the broadest and deepest end-to-end data and analytics platform. Ensure the responsible use of data and drive better business outcomes with fully integrated data management and governance, visual analytics and data storytelling, and collaboration \u2013 all with Salesforce\u2019s industry-leading Einstein built right in."}),"\n",(0,i.jsxs)(n.p,{children:["\u2013 ",(0,i.jsx)(n.a,{href:"https://www.tableau.com/",children:"The Tableau platform"})]}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"install-tableau-desktop",children:"Install Tableau Desktop"}),"\n",(0,i.jsxs)(n.p,{children:["Download and install ",(0,i.jsx)(n.a,{href:"https://www.tableau.com/products/desktop/download",children:"Tableau Desktop"}),"."]}),"\n",(0,i.jsx)(n.h2,{id:"download-and-install-the-flight-sql-jdbc-driver",children:"Download and install the Flight SQL JDBC driver"}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.a,{href:"https://docs.oracle.com/javase/tutorial/jdbc/basics/index.html",children:"JDBC"})," (Java Database Connectivity) is a standard way to connect to, and interact with a database. The Flight SQL driver is a JDBC driver implementation that utilizes the underlying ",(0,i.jsx)(n.a,{href:"https://arrow.apache.org/docs/format/FlightSql.html",children:"Flight SQL"})," protocol, allowing any program that connects via JDBC to seamlessly connect and interact with databases that support Flight SQL. Because Spice supports Flight SQL, this driver acts as a bridge, enabling Tableau to establish a connection with Spice, execute queries, and retrieve data."]}),"\n",(0,i.jsxs)(n.ol,{children:["\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.strong,{children:"Download the Flight SQL JDBC driver"})}),"\n"]}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:["Visit the ",(0,i.jsx)(n.a,{href:"https://central.sonatype.com/artifact/org.apache.arrow/flight-sql-jdbc-driver/",children:"Flight SQL JDBC driver"})," page"]}),"\n",(0,i.jsxs)(n.li,{children:["Select the ",(0,i.jsx)(n.strong,{children:"Versions"})," tab"]}),"\n",(0,i.jsxs)(n.li,{children:["Click ",(0,i.jsx)(n.strong,{children:"Browse"}),"  next to the version you want to download"]}),"\n",(0,i.jsxs)(n.li,{children:["Click the ",(0,i.jsx)(n.code,{children:"flight-sql-jdbc-driver-XX.XX.XX.jar"})," file (with only the ",(0,i.jsx)(n.code,{children:".jar"})," file extension) from the list of files to download the driver jar file"]}),"\n"]}),"\n",(0,i.jsxs)(n.ol,{start:"2",children:["\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.strong,{children:"Copy the downloaded jar file into the following directory based on your operating system"})}),"\n"]}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:["Windows: ",(0,i.jsx)(n.code,{children:"C:\\Program Files\\Tableau\\Drivers"})]}),"\n",(0,i.jsxs)(n.li,{children:["Mac: ",(0,i.jsx)(n.code,{children:"~/Library/Tableau/Drivers"})]}),"\n",(0,i.jsxs)(n.li,{children:["Linux: ",(0,i.jsx)(n.code,{children:"/opt/tableau/tableau_driver/jdbc"})]}),"\n",(0,i.jsx)(n.li,{children:"Start or restart Tableau"}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"configure-a-spice-connection",children:"Configure a Spice connection"}),"\n",(0,i.jsxs)(n.ol,{children:["\n",(0,i.jsxs)(n.li,{children:["Open ",(0,i.jsx)(n.strong,{children:"Tableau"})]}),"\n",(0,i.jsxs)(n.li,{children:["In the ",(0,i.jsx)(n.strong,{children:"Connect"})," column, under ",(0,i.jsx)(n.strong,{children:"To a Server"}),", select ",(0,i.jsx)(n.strong,{children:"Other Databases (JDBC)"}),"."]}),"\n",(0,i.jsx)(n.li,{children:"Provide the following configuration:"}),"\n"]}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:"URL"}),": ",(0,i.jsx)(n.code,{children:"jdbc:arrow-flight-sql://127.0.0.1:50051?useEncryption=false"})]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.strong,{children:"Dialect"}),": ",(0,i.jsx)(n.code,{children:"PostgreSQL"})]}),"\n"]}),"\n",(0,i.jsx)("img",{width:"400",src:"/img/tableau/tableau-jdbc-conn.png"}),"\n",(0,i.jsxs)(n.ol,{start:"4",children:["\n",(0,i.jsx)(n.li,{children:"Ensure Spice is running"}),"\n",(0,i.jsxs)(n.li,{children:["Click ",(0,i.jsx)(n.strong,{children:"Sign In"})]}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"working-with-spice-datasets",children:"Working with Spice datasets"}),"\n",(0,i.jsxs)(n.p,{children:["Once connected, Spice datasets will be listed under the ",(0,i.jsx)(n.code,{children:"datafusion.public"})," schema."]}),"\n",(0,i.jsx)(n.admonition,{type:"note",children:(0,i.jsxs)(n.p,{children:["Tableau support is currently in alpha, and not all functionality is supported. Use ",(0,i.jsx)(n.strong,{children:"New Custom SQL"})," to start working with Spice datasets as shown below."]})}),"\n",(0,i.jsx)("img",{width:"800",src:"/img/tableau/tableau-tables-list.png"}),"\n",(0,i.jsx)("img",{width:"800",src:"/img/tableau/tableau-custom-sql.png"}),"\n",(0,i.jsx)("img",{width:"800",src:"/img/tableau/tableau-spice-chart.png"})]})}function h(e={}){const{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(d,{...e})}):d(e)}},8453:(e,n,t)=>{t.d(n,{R:()=>l,x:()=>r});var i=t(6540);const s={},a=i.createContext(s);function l(e){const n=i.useContext(a);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function r(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:l(e.components),i.createElement(a.Provider,{value:n},e.children)}}}]);
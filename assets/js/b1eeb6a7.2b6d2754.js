"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[2198],{6908:(e,n,a)=>{a.r(n),a.d(n,{assets:()=>c,contentTitle:()=>i,default:()=>h,frontMatter:()=>r,metadata:()=>o,toc:()=>d});var s=a(4848),t=a(8453);const r={title:"GraphQL Data Connector",sidebar_label:"GraphQL Data Connector",description:"GraphQL Data Connector Documentation"},i=void 0,o={id:"data-connectors/graphql",title:"GraphQL Data Connector",description:"GraphQL Data Connector Documentation",source:"@site/docs/data-connectors/graphql.md",sourceDirName:"data-connectors",slug:"/data-connectors/graphql",permalink:"/data-connectors/graphql",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/data-connectors/graphql.md",tags:[],version:"current",frontMatter:{title:"GraphQL Data Connector",sidebar_label:"GraphQL Data Connector",description:"GraphQL Data Connector Documentation"},sidebar:"docsSidebar",previous:{title:"FTP/SFTP Data Connector",permalink:"/data-connectors/ftp"},next:{title:"MySQL Data Connector",permalink:"/data-connectors/mysql"}},c={},d=[{value:"Configuration",id:"configuration",level:2},{value:"Pagination",id:"pagination",level:2},{value:"Working with JSON Data",id:"working-with-json-data",level:2},{value:"Accessing objects fields",id:"accessing-objects-fields",level:3},{value:"Piping array into rows",id:"piping-array-into-rows",level:3},{value:"Unnesting object properties",id:"unnesting-object-properties",level:3}];function l(e){const n={a:"a",admonition:"admonition",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",ul:"ul",...(0,t.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)(n.p,{children:["The ",(0,s.jsx)(n.a,{href:"https://graphql.org/",children:"GraphQL"})," Data Connector enables federated SQL queries on any GraphQL endpoint by specifying ",(0,s.jsx)(n.code,{children:"graphql"})," as the selector in the ",(0,s.jsx)(n.code,{children:"from"})," value for the dataset."]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-yaml",children:"datasets:\n  - from: graphql:your-graphql-endpoint\n    name: my_dataset\n    params:\n      json_path: data.some.nodes\n      query: |\n        {\n          some {\n            nodes {\n              field1\n              field2\n            }\n          }\n        }\n"})}),"\n",(0,s.jsx)(n.admonition,{title:"Limitations",type:"warning",children:(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"The GraphQL data connector does not support variables in the query."}),"\n",(0,s.jsx)(n.li,{children:"Filter pushdown is not currently supported; however, when using the limit, the connector will request only the necessary data."}),"\n",(0,s.jsxs)(n.li,{children:["Acceleration of response nested data only works with ",(0,s.jsx)(n.code,{children:"arrow"})," engine. Support for other engines is in progress."]}),"\n"]})}),"\n",(0,s.jsx)(n.h2,{id:"configuration",children:"Configuration"}),"\n",(0,s.jsxs)(n.p,{children:["The GraphQL data connector can be configured by providing the following ",(0,s.jsx)(n.code,{children:"params"}),":"]}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"unnest_depth"}),": Depth level to automatically unnest objects to. By default, disabled if unspecified or ",(0,s.jsx)(n.code,{children:"0"}),"."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"auth_token"}),": The authentication token to use to connect to the GraphQL server. Uses bearer authentication. E.g. ",(0,s.jsx)(n.code,{children:"auth_token: my_secret_token"})]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"auth_token_key"}),": The secret key containing the authentication token to use to connect to the GraphQL server. Can be used instead of ",(0,s.jsx)(n.code,{children:"auth_token"}),".\nE.g. ",(0,s.jsx)(n.code,{children:"auth_token_key: my_secret_token_key"})]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"auth_user"}),": The username to use for basic auth. E.g. ",(0,s.jsx)(n.code,{children:"auth_user: my_user"})]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"auth_user_key"}),": The secret key containing the user to use for basic auth. Can be used instead of ",(0,s.jsx)(n.code,{children:"auth_user"}),". E.g. ",(0,s.jsx)(n.code,{children:"auth_user_key: my_secret_user"})]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"auth_pass"}),": The password to use for basic auth. E.g. ",(0,s.jsx)(n.code,{children:"auth_pass: my_password"})]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"auth_pass_key"}),": The secret key containing the password to use for basic auth. Can be used instead of ",(0,s.jsx)(n.code,{children:"auth_pass"}),". E.g. ",(0,s.jsx)(n.code,{children:"auth_pass_key: my_secret_password"})]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"query"}),": The GraphQL query to execute. E.g."]}),"\n"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-yaml",children:"query: |\n  {\n    some {\n      nodes {\n        field1\n        field2\n      }\n    }\n  }\n"})}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"json_path"}),": The path to the JSON data in the response. E.g. ",(0,s.jsx)(n.code,{children:"json_path: data.some.nodes"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Example using GitHub GraphQL API using Bearer Auth:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-yaml",children:"from: graphql:https://api.github.com/graphql\nname: stars\nparams:\n  auth_token: [github_token]\n  json_path: data.viewer.starredRepositories.nodes\n  query: |\n    {\n      viewer {\n        starredRepositories {\n          nodes {\n            name\n            stargazerCount\n            languages (first: 10) {\n              nodes {\n                name\n              }\n            }\n          }\n        }\n      }\n    }\n\n"})}),"\n",(0,s.jsx)(n.p,{children:"Example using Basic Auth:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-yaml",children:"from: graphql:https://my-site.com/graphql\nname: my_dataset\nparams:\n  auth_user: [my_user]\n  auth_pass: [my_password]\n  json_path: data.some.nodes\n  query: |\n    {\n      some {\n        nodes {\n          field1\n          field2\n        }\n      }\n    }\n"})}),"\n",(0,s.jsx)(n.h2,{id:"pagination",children:"Pagination"}),"\n",(0,s.jsxs)(n.p,{children:["The GraphQL Data Connector supports automatic pagination of the response for queries using ",(0,s.jsx)(n.a,{href:"https://graphql.org/learn/pagination/",children:"cursor pagination"}),"."]}),"\n",(0,s.jsxs)(n.p,{children:["In order to enable pagination you need to specify ",(0,s.jsx)(n.code,{children:"first"})," and ",(0,s.jsx)(n.code,{children:"pageInfo"})," with both ",(0,s.jsx)(n.code,{children:"endCursor"})," and ",(0,s.jsx)(n.code,{children:"hasNextPage"})," fields. The ",(0,s.jsx)(n.code,{children:"json_path"})," must point to the field which is the child of the paginated resource."]}),"\n",(0,s.jsx)(n.p,{children:"Example:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-yaml",children:'from: graphql:https://api.github.com/graphql\nname: stargazers\nparams:\n  auth_token: [github_token]\n  json_path: data.repository.stargazers.edges\n  query: |\n    {\n      repository(name: "spiceai", owner: "spiceai") {\n        id\n        name\n        stargazers(first: 100) {\n          edges {\n            node {\n              id\n              name\n              login\n            }\n          }\n          pageInfo {\n            hasNextPage\n            endCursor\n          }\n        }\n\n      }\n    }\ndescription: spiceai stargazers\nacceleration:\n  enabled: true\n  refresh_mode: full\n  refresh_check_interval: 30m\n'})}),"\n",(0,s.jsx)(n.h2,{id:"working-with-json-data",children:"Working with JSON Data"}),"\n",(0,s.jsxs)(n.p,{children:["Tips for working with JSON data. For more information see ",(0,s.jsx)(n.a,{href:"https://datafusion.apache.org/user-guide/sql/scalar_functions.html#array-functions",children:"Datafusion Docs"}),"."]}),"\n",(0,s.jsx)(n.h3,{id:"accessing-objects-fields",children:"Accessing objects fields"}),"\n",(0,s.jsx)(n.p,{children:"You can access the fields of the object using the square bracket notation.\nArrays are indexed from 1."}),"\n",(0,s.jsxs)(n.p,{children:["Example for the stargazers query from ",(0,s.jsx)(n.a,{href:"#pagination",children:"pagination section"}),":"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-bash",children:"sql> select node['login'] as login, node['name'] as name from stargazers limit 5;\n+--------------+----------------------+\n| login        | name                 |\n+--------------+----------------------+\n| simsieg      | Simon Siegert        |\n| davidmathers | David Mathers        |\n| ahmedtadde   | Ahmed Tadde          |\n| lordhamlet   | Shih-Fen Cheng       |\n| thinmy       | Thinmy Patrick Alves |\n+--------------+----------------------+\n"})}),"\n",(0,s.jsx)(n.h3,{id:"piping-array-into-rows",children:"Piping array into rows"}),"\n",(0,s.jsxs)(n.p,{children:["You can use Datafusion ",(0,s.jsx)(n.code,{children:"unnest"})," function to pipe values from array into rows.\nWe'll be using ",(0,s.jsx)(n.a,{href:"https://countries.trevorblades.com",children:"countries GraphQL api"})," as an example."]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-yaml",children:"from: graphql:https://countries.trevorblades.com\nname: countries\nparams:\n  json_path: data.continents\n  query: |\n    {\n      continents {\n        name\n        countries {\n          name\n          capital\n        }\n      }\n    }\n\ndescription: countries\nacceleration:\n  enabled: true\n  refresh_mode: full\n  refresh_check_interval: 30m\n"})}),"\n",(0,s.jsx)(n.p,{children:"Example query:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-bash",children:"sql> select continent, country['name'] as country, country['capital'] as capital\nfrom (select name as continent, unnest(countries) as country from countries)\nwhere continent = 'North America' limit 5;\n+---------------+---------------------+--------------+\n| continent     | country             | capital      |\n+---------------+---------------------+--------------+\n| North America | Antigua and Barbuda | Saint John's |\n| North America | Anguilla            | The Valley   |\n| North America | Aruba               | Oranjestad   |\n| North America | Barbados            | Bridgetown   |\n| North America | Saint Barth\xe9lemy    | Gustavia     |\n+---------------+---------------------+--------------+\n"})}),"\n",(0,s.jsx)(n.h3,{id:"unnesting-object-properties",children:"Unnesting object properties"}),"\n",(0,s.jsxs)(n.p,{children:["You can also use the ",(0,s.jsx)(n.code,{children:"unnest_depth"})," parameter to control automatic unnesting of objects from GraphQL responses."]}),"\n",(0,s.jsx)(n.p,{children:"This examples uses the GitHub stargazers endpoint:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-yaml",children:'from: graphql:https://api.github.com/graphql\nname: stargazers\nparams:\n  auth_token: [github_token]\n  unnest_depth: 2\n  json_path: data.repository.stargazers.edges\n  query: |\n    {\n      repository(name: "spiceai", owner: "spiceai") {\n        id\n        name\n        stargazers(first: 100) {\n          edges {\n            node {\n              id\n              name\n              login\n            }\n          }\n          pageInfo {\n            hasNextPage\n            endCursor\n          }\n        }\n\n      }\n    }\n'})}),"\n",(0,s.jsxs)(n.p,{children:["If ",(0,s.jsx)(n.code,{children:"unnest_depth"})," is set to 0, or unspecified, object unnesting is disabled. When enabled, unnesting automatically moves nested fields to the parent level."]}),"\n",(0,s.jsx)(n.p,{children:"Without unnesting, stargazers data looks like this in a query:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-bash",children:"sql> select node from stargazers limit 1;\n+------------------------------------------------------------+\n| node                                                       |\n+------------------------------------------------------------+\n| {id: MDQ6VXNlcjcwNzIw, login: ashtom, name: Thomas Dohmke} |\n+------------------------------------------------------------+\n"})}),"\n",(0,s.jsx)(n.p,{children:"With unnesting, these properties are automatically placed into their own columns:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-bash",children:"sql> select node from stargazers limit 1;\n+------------------+--------+---------------+\n| id               | login  | name          |\n+------------------+--------+---------------+\n| MDQ6VXNlcjcwNzIw | ashtom | Thomas Dohmke |\n+------------------+--------+---------------+\n"})}),"\n",(0,s.jsx)(n.admonition,{title:"Limitations",type:"warning",children:(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"Automatic object unnesting will overwrite columns if multiple properties contain the same sub-keys."}),"\n"]})})]})}function h(e={}){const{wrapper:n}={...(0,t.R)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(l,{...e})}):l(e)}},8453:(e,n,a)=>{a.d(n,{R:()=>i,x:()=>o});var s=a(6540);const t={},r=s.createContext(t);function i(e){const n=s.useContext(r);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:i(e.components),s.createElement(r.Provider,{value:n},e.children)}}}]);
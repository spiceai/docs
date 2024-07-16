"use strict";(self.webpackChunkspiceaidocs=self.webpackChunkspiceaidocs||[]).push([[935],{4562:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>d,contentTitle:()=>r,default:()=>h,frontMatter:()=>i,metadata:()=>a,toc:()=>o});var l=s(4848),c=s(8453);const i={title:"SELECT",sidebar_label:"SELECT",sidebar_position:4,pagination_prev:"reference/index",pagination_next:null},r=void 0,a={id:"reference/sql/select",title:"SELECT",description:"Spice is built on Apache DataFusion and uses the PostgreSQL dialect, even when querying datasources with different SQL dialects.",source:"@site/docs/reference/sql/select.md",sourceDirName:"reference/sql",slug:"/reference/sql/select",permalink:"/reference/sql/select",draft:!1,unlisted:!1,editUrl:"https://github.com/spiceai/docs/tree/trunk/spiceaidocs/docs/reference/sql/select.md",tags:[],version:"current",sidebarPosition:4,frontMatter:{title:"SELECT",sidebar_label:"SELECT",sidebar_position:4,pagination_prev:"reference/index",pagination_next:null},sidebar:"docsSidebar",previous:{title:"Reference",permalink:"/reference/"}},d={},o=[{value:"SELECT syntax",id:"select-syntax",level:2},{value:"WITH clause",id:"with-clause",level:3},{value:"SELECT clause",id:"select-clause",level:3},{value:"FROM clause",id:"from-clause",level:3},{value:"WHERE clause",id:"where-clause",level:3},{value:"JOIN clause",id:"join-clause",level:3},{value:"INNER JOIN",id:"inner-join",level:4},{value:"LEFT OUTER JOIN",id:"left-outer-join",level:4},{value:"RIGHT OUTER JOIN",id:"right-outer-join",level:4},{value:"FULL OUTER JOIN",id:"full-outer-join",level:4},{value:"NATURAL JOIN",id:"natural-join",level:4},{value:"CROSS JOIN",id:"cross-join",level:4},{value:"GROUP BY clause",id:"group-by-clause",level:3},{value:"HAVING clause",id:"having-clause",level:3},{value:"UNION clause",id:"union-clause",level:3},{value:"ORDER BY clause",id:"order-by-clause",level:3},{value:"LIMIT clause",id:"limit-clause",level:3},{value:"EXCLUDE and EXCEPT clause",id:"exclude-and-except-clause",level:3}];function t(e){const n={a:"a",admonition:"admonition",br:"br",code:"code",h2:"h2",h3:"h3",h4:"h4",p:"p",pre:"pre",...(0,c.R)(),...e.components};return(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(n.admonition,{type:"info",children:(0,l.jsxs)(n.p,{children:["Spice is built on ",(0,l.jsx)(n.a,{href:"https://datafusion.apache.org/",children:"Apache DataFusion"})," and uses the PostgreSQL dialect, even when querying datasources with different SQL dialects."]})}),"\n",(0,l.jsx)(n.h2,{id:"select-syntax",children:"SELECT syntax"}),"\n",(0,l.jsx)(n.p,{children:"The queries in Spice scan data from tables and return 0 or more rows.\nPlease be aware that column names in queries are made lower-case, but not on the inferred schema. Accordingly, if you want to query against a capitalized field, make sure to use double quotes."}),"\n",(0,l.jsx)(n.p,{children:"Spice supports the following syntax for queries:"}),"\n",(0,l.jsxs)(n.p,{children:["[ ",(0,l.jsx)(n.a,{href:"#with-clause",children:"WITH"})," with_query [, ...] ]",(0,l.jsx)(n.br,{}),"\n",(0,l.jsx)(n.a,{href:"#select-clause",children:"SELECT"})," [ ALL | DISTINCT ] select_expr [, ...]",(0,l.jsx)(n.br,{}),"\n","[ ",(0,l.jsx)(n.a,{href:"#from-clause",children:"FROM"})," from_item [, ...] ]",(0,l.jsx)(n.br,{}),"\n","[ ",(0,l.jsx)(n.a,{href:"#join-clause",children:"JOIN"})," join_item [, ...] ]",(0,l.jsx)(n.br,{}),"\n","[ ",(0,l.jsx)(n.a,{href:"#where-clause",children:"WHERE"})," condition ]",(0,l.jsx)(n.br,{}),"\n","[ ",(0,l.jsx)(n.a,{href:"#group-by-clause",children:"GROUP BY"})," grouping_element [, ...] ]",(0,l.jsx)(n.br,{}),"\n","[ ",(0,l.jsx)(n.a,{href:"#having-clause",children:"HAVING"})," condition]",(0,l.jsx)(n.br,{}),"\n","[ ",(0,l.jsx)(n.a,{href:"#union-clause",children:"UNION"})," [ ALL | select ]",(0,l.jsx)(n.br,{}),"\n","[ ",(0,l.jsx)(n.a,{href:"#order-by-clause",children:"ORDER BY"})," expression [ ASC | DESC ][, ...] ]",(0,l.jsx)(n.br,{}),"\n","[ ",(0,l.jsx)(n.a,{href:"#limit-clause",children:"LIMIT"})," count ]",(0,l.jsx)(n.br,{}),"\n","[ ",(0,l.jsx)(n.a,{href:"#exclude-and-except-clause",children:"EXCLUDE | EXCEPT"})," ]"]}),"\n",(0,l.jsx)(n.h3,{id:"with-clause",children:"WITH clause"}),"\n",(0,l.jsx)(n.p,{children:"A with clause allows to give names for queries and reference them by name."}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-sql",children:"WITH x AS (SELECT a, MAX(b) AS b FROM t GROUP BY a)\nSELECT a, b FROM x;\n"})}),"\n",(0,l.jsx)(n.h3,{id:"select-clause",children:"SELECT clause"}),"\n",(0,l.jsxs)(n.p,{children:["The ",(0,l.jsx)(n.code,{children:"SELECT"})," clause is used to select data from a database by defining the colummns it returns.  Each ",(0,l.jsx)(n.code,{children:"select_expr"})," in the\nSELECT list can be an expression or wildcards."]}),"\n",(0,l.jsx)(n.p,{children:"Example:"}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-sql",children:"SELECT a, b, a + b FROM table\n"})}),"\n",(0,l.jsxs)(n.p,{children:["The ",(0,l.jsx)(n.code,{children:"DISTINCT"})," quantifier can be added to make the query return all distinct rows.\nBy default ",(0,l.jsx)(n.code,{children:"ALL"})," will be used, which returns all the rows."]}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-sql",children:"SELECT DISTINCT person, age FROM employees\n"})}),"\n",(0,l.jsx)(n.h3,{id:"from-clause",children:"FROM clause"}),"\n",(0,l.jsxs)(n.p,{children:["The ",(0,l.jsx)(n.code,{children:"FROM"})," clause is used to specify which table to select data from."]}),"\n",(0,l.jsx)(n.p,{children:"Example:"}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-sql",children:"SELECT t.a FROM table AS t\n"})}),"\n",(0,l.jsx)(n.h3,{id:"where-clause",children:"WHERE clause"}),"\n",(0,l.jsxs)(n.p,{children:["The ",(0,l.jsx)(n.code,{children:"WHERE"})," clause is used define the conditions to filter the query results."]}),"\n",(0,l.jsx)(n.p,{children:"Example:"}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-sql",children:"SELECT a FROM table WHERE a > 10\n"})}),"\n",(0,l.jsx)(n.h3,{id:"join-clause",children:"JOIN clause"}),"\n",(0,l.jsxs)(n.p,{children:["Spice supports ",(0,l.jsx)(n.code,{children:"INNER JOIN"}),", ",(0,l.jsx)(n.code,{children:"LEFT OUTER JOIN"}),", ",(0,l.jsx)(n.code,{children:"RIGHT OUTER JOIN"}),", ",(0,l.jsx)(n.code,{children:"FULL OUTER JOIN"}),", ",(0,l.jsx)(n.code,{children:"NATURAL JOIN"})," and ",(0,l.jsx)(n.code,{children:"CROSS JOIN"}),"."]}),"\n",(0,l.jsx)(n.p,{children:"The following examples are based on this table:"}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-sql",children:"select * from x;\n+----------+----------+\n| column_1 | column_2 |\n+----------+----------+\n| 1        | 2        |\n+----------+----------+\n"})}),"\n",(0,l.jsx)(n.h4,{id:"inner-join",children:"INNER JOIN"}),"\n",(0,l.jsxs)(n.p,{children:["The keywords ",(0,l.jsx)(n.code,{children:"JOIN"})," or ",(0,l.jsx)(n.code,{children:"INNER JOIN"})," define a join that only shows rows where there is a match in both tables."]}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-sql",children:"select * from x inner join x y ON x.column_1 = y.column_1;\n+----------+----------+----------+----------+\n| column_1 | column_2 | column_1 | column_2 |\n+----------+----------+----------+----------+\n| 1        | 2        | 1        | 2        |\n+----------+----------+----------+----------+\n"})}),"\n",(0,l.jsx)(n.h4,{id:"left-outer-join",children:"LEFT OUTER JOIN"}),"\n",(0,l.jsxs)(n.p,{children:["The keywords ",(0,l.jsx)(n.code,{children:"LEFT JOIN"})," or ",(0,l.jsx)(n.code,{children:"LEFT OUTER JOIN"})," define a join that includes all rows from the left table even if there\nis not a match in the right table. When there is no match, null values are produced for the right side of the join."]}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-sql",children:"select * from x left join x y ON x.column_1 = y.column_2;\n+----------+----------+----------+----------+\n| column_1 | column_2 | column_1 | column_2 |\n+----------+----------+----------+----------+\n| 1        | 2        |          |          |\n+----------+----------+----------+----------+\n"})}),"\n",(0,l.jsx)(n.h4,{id:"right-outer-join",children:"RIGHT OUTER JOIN"}),"\n",(0,l.jsxs)(n.p,{children:["The keywords ",(0,l.jsx)(n.code,{children:"RIGHT JOIN"})," or ",(0,l.jsx)(n.code,{children:"RIGHT OUTER JOIN"})," define a join that includes all rows from the right table even if there\nis not a match in the left table. When there is no match, null values are produced for the left side of the join."]}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-sql",children:"select * from x right join x y ON x.column_1 = y.column_2;\n+----------+----------+----------+----------+\n| column_1 | column_2 | column_1 | column_2 |\n+----------+----------+----------+----------+\n|          |          | 1        | 2        |\n+----------+----------+----------+----------+\n"})}),"\n",(0,l.jsx)(n.h4,{id:"full-outer-join",children:"FULL OUTER JOIN"}),"\n",(0,l.jsxs)(n.p,{children:["The keywords ",(0,l.jsx)(n.code,{children:"FULL JOIN"})," or ",(0,l.jsx)(n.code,{children:"FULL OUTER JOIN"})," define a join that is effectively a union of a ",(0,l.jsx)(n.code,{children:"LEFT OUTER JOIN"})," and\n",(0,l.jsx)(n.code,{children:"RIGHT OUTER JOIN"}),". It will show all rows from the left and right side of the join and will produce null values on\neither side of the join where there is not a match."]}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-sql",children:"select * from x full outer join x y ON x.column_1 = y.column_2;\n+----------+----------+----------+----------+\n| column_1 | column_2 | column_1 | column_2 |\n+----------+----------+----------+----------+\n| 1        | 2        |          |          |\n|          |          | 1        | 2        |\n+----------+----------+----------+----------+\n"})}),"\n",(0,l.jsx)(n.h4,{id:"natural-join",children:"NATURAL JOIN"}),"\n",(0,l.jsx)(n.p,{children:"A natural join defines an inner join based on common column names found between the input tables. When no common\ncolumn names are found, it behaves like a cross join."}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-sql",children:"select * from x natural join x y;\n+----------+----------+\n| column_1 | column_2 |\n+----------+----------+\n| 1        | 2        |\n+----------+----------+\n"})}),"\n",(0,l.jsx)(n.h4,{id:"cross-join",children:"CROSS JOIN"}),"\n",(0,l.jsx)(n.p,{children:"A cross join produces a cartesian product that matches every row in the left side of the join with every row in the\nright side of the join."}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-sql",children:"select * from x cross join x y;\n+----------+----------+----------+----------+\n| column_1 | column_2 | column_1 | column_2 |\n+----------+----------+----------+----------+\n| 1        | 2        | 1        | 2        |\n+----------+----------+----------+----------+\n"})}),"\n",(0,l.jsx)(n.h3,{id:"group-by-clause",children:"GROUP BY clause"}),"\n",(0,l.jsxs)(n.p,{children:["The ",(0,l.jsx)(n.code,{children:"GROUP BY"})," clause groups together input rows that have the same value into summary rows."]}),"\n",(0,l.jsxs)(n.p,{children:[(0,l.jsx)(n.code,{children:"GROUP BY"})," is typically used with aggregrate functions (",(0,l.jsx)(n.code,{children:"COUNT()"}),", ",(0,l.jsx)(n.code,{children:"MAX()"}),", ",(0,l.jsx)(n.code,{children:"SUM()"}),"), but if no aggregate functions are\nincluded, the query with a ",(0,l.jsx)(n.code,{children:"GROUP BY"})," clause is the same as ",(0,l.jsx)(n.code,{children:"SELECT DISTINCT"}),"."]}),"\n",(0,l.jsx)(n.p,{children:"Example:"}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-sql",children:"SELECT a, b, MAX(c) FROM table GROUP BY a, b\n"})}),"\n",(0,l.jsxs)(n.p,{children:["Some aggregation functions accept optional ordering requirement, such as ",(0,l.jsx)(n.code,{children:"ARRAY_AGG"}),". If a requirement is given,\naggregation is calculated in the order of the requirement."]}),"\n",(0,l.jsx)(n.p,{children:"Example:"}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-sql",children:"SELECT a, b, ARRAY_AGG(c, ORDER BY d) FROM table GROUP BY a, b\n"})}),"\n",(0,l.jsx)(n.h3,{id:"having-clause",children:"HAVING clause"}),"\n",(0,l.jsxs)(n.p,{children:["The ",(0,l.jsx)(n.code,{children:"HAVING"})," clause can be used with ",(0,l.jsx)(n.code,{children:"GROUP BY"})," to eliminate groups that don't satisfy the condition given."]}),"\n",(0,l.jsx)(n.p,{children:"Example:"}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-sql",children:"SELECT a, b, MAX(c) FROM table GROUP BY a, b HAVING MAX(c) > 10\n"})}),"\n",(0,l.jsx)(n.h3,{id:"union-clause",children:"UNION clause"}),"\n",(0,l.jsxs)(n.p,{children:["The ",(0,l.jsx)(n.code,{children:"UNION"})," clause combines the results of two or more ",(0,l.jsx)(n.code,{children:"SELECT"})," statments.  By default ",(0,l.jsx)(n.code,{children:"UNION"})," removes\nduplicates.  To include duplicates, use ",(0,l.jsx)(n.code,{children:"UNION ALL"}),"."]}),"\n",(0,l.jsx)(n.p,{children:"Example:"}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-sql",children:"SELECT\n    a,\n    b,\n    c\nFROM table1\nUNION ALL\nSELECT\n    a,\n    b,\n    c\nFROM table2\n"})}),"\n",(0,l.jsx)(n.h3,{id:"order-by-clause",children:"ORDER BY clause"}),"\n",(0,l.jsxs)(n.p,{children:["Orders the results by the referenced expression. By default it uses ascending order (",(0,l.jsx)(n.code,{children:"ASC"}),").\nThis order can be changed to descending by adding ",(0,l.jsx)(n.code,{children:"DESC"})," after the order-by expressions."]}),"\n",(0,l.jsx)(n.p,{children:"Examples:"}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-sql",children:"SELECT age, person FROM table ORDER BY age;\nSELECT age, person FROM table ORDER BY age DESC;\nSELECT age, person FROM table ORDER BY age, person DESC;\n"})}),"\n",(0,l.jsx)(n.h3,{id:"limit-clause",children:"LIMIT clause"}),"\n",(0,l.jsxs)(n.p,{children:["Limits the number of rows to be a maximum of ",(0,l.jsx)(n.code,{children:"count"})," rows. ",(0,l.jsx)(n.code,{children:"count"})," should be a non-negative integer."]}),"\n",(0,l.jsx)(n.p,{children:"Example:"}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-sql",children:"SELECT age, person FROM table\nLIMIT 10\n"})}),"\n",(0,l.jsx)(n.h3,{id:"exclude-and-except-clause",children:"EXCLUDE and EXCEPT clause"}),"\n",(0,l.jsx)(n.p,{children:"Excluded named columns from query results."}),"\n",(0,l.jsxs)(n.p,{children:["Example selecting all columns except for ",(0,l.jsx)(n.code,{children:"age"})," and ",(0,l.jsx)(n.code,{children:"person"}),":"]}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-sql",children:"SELECT * EXCEPT(age, person)\nFROM table;\n"})}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-sql",children:"SELECT * EXCLUDE(age, person)\nFROM table;\n"})})]})}function h(e={}){const{wrapper:n}={...(0,c.R)(),...e.components};return n?(0,l.jsx)(n,{...e,children:(0,l.jsx)(t,{...e})}):t(e)}},8453:(e,n,s)=>{s.d(n,{R:()=>r,x:()=>a});var l=s(6540);const c={},i=l.createContext(c);function r(e){const n=l.useContext(i);return l.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(c):e.components||c:r(e.components),l.createElement(i.Provider,{value:n},e.children)}}}]);
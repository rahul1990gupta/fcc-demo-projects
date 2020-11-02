import Head from 'next/head'
const { default: NavBar } = require("./NavBar");

const Layout = (props) => (
    <div>
        <head>
            <title> Bitzprice</title>
            <link rel="stylesheet"
            href="https://bootswatch.com/4/cerulean/bootstrap.min.css"/>
     
        </head>
        <NavBar />
        <div className="container">
            {props.children}
        </div>
        
    </div>
)

export default Layout;
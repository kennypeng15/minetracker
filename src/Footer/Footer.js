import "./Footer.css";

export default function Footer() {
    return (
        <>
            <div className="footer">
                <p>
                    This page is built with the <a href="https://recharts.org/en-US/">Recharts</a> library on top of React.
                    It's hosted on GitHub Pages and deployed with GitHub Actions and the <a href="https://github.com/gitname/react-gh-pages">react-gh-pages</a> library.
                </p>
                <p>
                    Writeups about <a href="https://github.com/kennypeng15/minetracker">this frontend specifically</a> 
                    and <a href="https://kennypeng15.github.io/projects/minetracker/index.html">the entire MineTracker Project</a> are also available.
                </p>
                <p>
                    The source code for this page and for the MineTracker project in general can be found on <a href="https://github.com/kennypeng15">my GitHub page.</a>
                </p>
                <p>
                    Made by Kenny Peng, 2023-24.
                </p>
                <p>
                    Teddy was here! :3
                </p>
            </div>
        </>
    )
}
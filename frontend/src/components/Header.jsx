
import '../styles/Header.css';
import logo from '../assets/OverclockLogo.png'

function Header(){
    return(
        <header>
            <div id = "navigator-container">
            <img src = {logo} alt = "Overclock logo"/>
                <nav>
                    <ul>
                        <li><a href="#">Home</a></li>
                        <li>Stats</li>
                        <li>Settings</li>
                        <li>About</li>
                        <li>Contact</li>
                    </ul>
                </nav>
            </div>
        </header>
    );

}

export default Header
import "./Header.css";

export default function Header() {
  return (
    <>
      <div className="header">
        <h1>Welcome to MineTracker!</h1>
        <p>
          MineTracker is an app for tracking and displaying information about my{" "}
          <a href="https://minesweeper.online/">minesweeper.online</a> games.
        </p>
      </div>
    </>
  );
}

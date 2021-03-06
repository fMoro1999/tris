import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

class Move {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return "(" + this.x + ", " + this.y + ")";
  }
}

class Moves {
  static computeMove(number) {
    return new Move(parseInt(number / 3) + 1, (number % 3) + 1);
  }
}

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  buildCubeMatrix() {
    let lastValid = 0;

    let boardRows = [];
    for (let i = 0; i < 9; i++) {
      // 0, 3, 6
      if (i % 3 === 0) {
        lastValid = i;

        let squares = [];
        for (let j = 0; j < 3; j++) {
          let square = this.renderSquare(lastValid++);
          squares.push(square);
        }

        let boardRow = React.createElement(
          "div",
          { className: "board-row" },
          squares
        );
        boardRows.push(boardRow);
      }
    }

    return React.createElement("div", { className: "main-div" }, boardRows);
  }

  render() {
    return <div>{this.buildCubeMatrix()}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          move: null,
        },
      ],
      stepNumber: 0,
      xIsNext: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    let currentMove = current.move;

    if (this.declareWinner(squares) || squares[i]) return;

    squares[i] = this.state.xIsNext ? "X" : "O";
    currentMove = i;
    this.setState({
      history: history.concat([
        {
          squares: squares,
          move: currentMove,
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(stepNumber) {
    this.setState({
      stepNumber: stepNumber,
      xIsNext: stepNumber % 2 === 0,
    });
    if (stepNumber !== 0) this.highlightSelectedMove(stepNumber);
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = this.declareWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move
        ? "Go to move #" + move + " " + Moves.computeMove(history[move].move)
        : "Go to game start";
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status;
    if (winner) status = "The winner is... " + winner + ". Congrats!";
    else if (!winner && moves.length === 10) status = "Tie! Nobody won";
    else status = "Next player: " + (this.state.xIsNext ? "X" : "O");

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol start="0">{moves}</ol>
        </div>
      </div>
    );
  }

  declareWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];

      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c])
        return squares[a];
    }

    return null;
  }

  getSquareAt(index) {
    let boardRows = document.getElementsByClassName("board-row");

    let cnt = 0;
    let child;
    for (let i = 0; i < boardRows.length; i++) {
      child = boardRows[i].childNodes;
      for (let j = 0; j < child.length; j++) {
        if (cnt === index) return child[cnt % 3];
        cnt++;
      }
    }
    return null;
  }

  getMoveByStep(step) {
    return this.state.history[step].move;
  }

  highlightSelectedMove(step) {
    let toHighlight = this.getSquareAtStep(step);
    this.highlightFor(toHighlight, 1500);
  }

  highlightFor(toHighlight, ms) {
    var orig = toHighlight.style.color;
    toHighlight.style.color = "#FF0000";
    setTimeout(() => (toHighlight.style.color = orig), ms);
  }

  getSquareAtStep(step) {
    let move = this.getMoveByStep(step);
    return this.getSquareAt(move);
  }

  highlightWinningMove() {
    for (let i = 0; i < this.getWinningSquares().length; i++) {
      this.highlightFor(this.getWinningSquares[i], 1500);
    }
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

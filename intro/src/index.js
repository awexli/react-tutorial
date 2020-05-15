import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function OrderedList(props) {
  const isReversed = props.isMoveReverse
    ? "game-info__moves --reverse"
    : "game-info__moves";

  return <ol className={isReversed}> {props.movesList} </ol>;
}

function Toggle(props) {
  const toggleClass = props.isMoveReverse
    ? "game-info__toggle-btn --active"
    : "game-info__toggle-btn";

  return (
    <button
      className={toggleClass}
      onClick={() => {
        props.onClick();
      }}
    >
      Descending Order
    </button>
  );
}

function Square(props) {
  return (
    <button
      className={props.className}
      onClick={() => {
        props.onClick();
      }}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    const highlight =
      this.props.winningLine && this.props.winningLine.includes(i)
        ? "square --highlight"
        : "square";
    return (
      <Square
        className={highlight}
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    const squares = [];
    let squareNum = 0;

    for (let i = 0; i < this.props.boardDimension; i++) {
      const row = [];
      for (let j = 0; j < this.props.boardDimension; j++) {
        row.push(this.renderSquare(squareNum++));
      }
      squares.push(
        <div key={i} className='board-row'>
          {row}
        </div>
      );
    }

    return <div>{squares}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
        },
      ],
      coordinates: {},
      stepNumber: 0,
      boardDimension: 3,
      xIsNext: true,
      isMoveReverse: false,
    };
  }

  componentDidMount() {
    this.populateCoordinate();
  }

  populateCoordinate() {
    const dimensions = this.state.boardDimension;
    const totalSquares = dimensions * dimensions;
    const coordinates = {};
    let row = 0;
    let column = 0;

    for (let squareNum = 0; squareNum < totalSquares; squareNum++) {
      coordinates[squareNum] = `[${column++},${row}]`;
      column = column % dimensions;
      row = column === 0 ? row + 1 : row;
    }

    this.setState({
      coordinates: coordinates,
    });
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (calculateWinner(squares) || squares[i]) {
      return;
    }

    squares[i] = this.state.xIsNext ? "X" : "O";

    this.setState({
      history: history.concat([
        {
          squares: squares,
          lastSquare: i,
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  handleToggle() {
    this.setState({
      isMoveReverse: !this.state.isMoveReverse,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }

  render() {
    const history = this.state.history;
    const stepNumber = this.state.stepNumber;
    const current = history[stepNumber];
    const winner = calculateWinner(current.squares);
    const moves = history.map((step, move) => {
      const cell = step.lastSquare;
      const desc = move
        ? "Go to move #" + move + ` ${this.state.coordinates[cell]}`
        : "Go to game start";
      return (
        <li key={move}>
          <button
            className={move === stepNumber ? "move-list --active" : "move-list"}
            onClick={() => this.jumpTo(move)}
          >
            {desc}
          </button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = "Winner: " + winner.player;
    } else if (stepNumber === 9) {
      status = "Draw!";
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className='game'>
        <div className='game-board'>
          <Board
            winningLine={winner ? winner.line : null}
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            boardDimension={this.state.boardDimension}
          />
        </div>
        <div className='game-info'>
          <div>{status}</div>
          <Toggle
            isMoveReverse={this.state.isMoveReverse}
            onClick={() => {
              this.handleToggle();
            }}
          />
          <OrderedList
            isMoveReverse={this.state.isMoveReverse}
            movesList={moves}
          />
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
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
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { player: squares[a], line: lines[i] };
    }
  }

  return null;
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

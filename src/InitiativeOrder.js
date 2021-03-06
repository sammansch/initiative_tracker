import React, { Component } from "react";
import InitiativeEntry from "./InitiativeEntry";
import PropTypes from "prop-types";
import "./InitiativeOrder.css";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
var uniqueId = require("lodash.uniqueid");

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

class InitiativeOrder extends Component {
  constructor(props) {
    super(props);

    this.addEntry = this.addEntry.bind(this);
    this.updateEntry = this.updateEntry.bind(this);
    this.killChild = this.killChild.bind(this);
    this.sortEntries = this.sortEntries.bind(this);
    this.clearEntries = this.clearEntries.bind(this);
    this.updateNewName = this.updateNewName.bind(this);
    this.updateNewInit = this.updateNewInit.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);

    this.nameInputRef = React.createRef();
    this.initInputRef = React.createRef();

    this.state = {
      allEntries: props.initialEntries ? props.initialEntries : [],
      initiativeOrder: [],
      newEntry: {
        name: "",
        initiative: ""
      },
      activeIndex: -1,
    };
  }

  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(
      this.state.initiativeOrder,
      result.source.index,
      result.destination.index
    );

    this.setState({
      allEntries: items,
      initiativeOrder: items
    });
  }

  componentDidMount() {
    this.sortEntries();
    this.nameInputRef.current.focus();
  }

  updateNewName(event) {
    this.setState({
      newEntry: {
        ...this.state.newEntry,
        name: event.target.value
      }
    });
  }

  updateNewInit(event) {
    this.setState({
      newEntry: {
        ...this.state.newEntry,
        initiative: parseInt(event.target.value)
      }
    });
  }

  handleKeyDown(e) {
    // console.log(e.keyCode);

    switch (e.keyCode) {
      case 13:
        this.addEntry();
        this.nameInputRef.current.focus();
        break;
      case 37: //left
        break;
      case 38: //up
        if (this.state.activeIndex > -1) {
          if (this.state.activeIndex === 0) { this.nameInputRef.current.focus(); };
          this.setState({ activeIndex: this.state.activeIndex - 1 });
        }
        break;
      case 39: //right
        break;
      case 40: //down
        if (this.state.activeIndex < this.state.allEntries.length-1) {
          this.setState({ activeIndex: this.state.activeIndex + 1 });
        }
        break;
      default:

        break;

    }
  }

  clearEntries() {
    this.setState({
      allEntries: [],
      initiativeOrder: [],
      newEntry: {
        name: "",
        initiative: ""
      }
    });
  }

  compareEntries(a, b) {
    let comparison = 0;
    let a_value = a.initiative;
    let b_value = b.initiative;

    if (a_value > b_value) {
      // console.log(a_value + " is greater than " + b_value);
      comparison = 1;
    } else if (b_value > a_value) {
      // console.log(a_value + " is less than " + b_value);
      comparison = -1;
    } else {
      // console.log(a_value + " is equal to " + b_value);
      comparison = 0;
    }
    // reverse the array
    return comparison * -1;
  }

  sortEntries() {
    const { allEntries } = this.state;

    const sortedItems = [...allEntries].sort(this.compareEntries);

    const newInitiative = sortedItems;

    this.setState({
      initiativeOrder: newInitiative
    });
  }

  addEntry() {
    const { allEntries } = this.state;

    let newItems = [...allEntries];

    if (
      !isNaN(this.state.newEntry.initiative) &&
      this.state.newEntry.name.trim() !== ""
    ) {
      const newEntry = this.state.newEntry;
      newEntry.id = parseInt(uniqueId());

      newItems.push(newEntry);
    }

    this.setState(
      {
        allEntries: newItems,
        newEntry: {
          name: "",
          initiative: ""
        }
      },
      () => {
        this.sortEntries();
      }
    );
  }

  killChild(child) {
    const { initiativeOrder, allEntries } = this.state;

    // delete all reference to child
    let newInitiativeOrder = initiativeOrder.filter(e => e.id !== child);
    let newAllEntries = allEntries.filter(e => e.id !== child);

    this.setState({
      initiativeOrder: newInitiativeOrder,
      allEntries: newAllEntries
    });
  }

  updateEntry(id, propName, value) {
    this.setState(
      state => {
        const allEntries = state.allEntries.map((item, index) => {
          if (item.id === id) {
            // this still feels like a hack
            if (propName === "initiative") {
              value = parseInt(value);

              if (isNaN(value)) {
                return {
                  ...item,
                  [propName]: 0
                };
              } else {
                return {
                  ...item,
                  [propName]: parseInt(value)
                };
              }
            }

            return {
              ...item,
              [propName]: value
            };
          } else {
            return item;
          }
        });

        return {
          allEntries
        };
      },
      () => {
        this.sortEntries();
      }
    );
  }

  render() {
    const { initiativeOrder } = this.state;

    return (
      <div className="initiative_order">
        <div className="input">
          <div>
            <label htmlFor="char_name">Name</label>
            <input
              type="text"
              name="char_name"
              id="char_name"
              value={this.state.newEntry.name}
              onClick={e => {
                e.target.select();
              }}
              onChange={this.updateNewName}
              onKeyDown={this.handleKeyDown}
              ref={this.nameInputRef}
            ></input>
          </div>
          <div>
            <label htmlFor="init_val">Initiative</label>
            <input
              type="number"
              name="init_val"
              id="init_val"
              value={this.state.newEntry.initiative}
              onClick={e => {
                e.target.select();
              }}
              onChange={this.updateNewInit}
              onKeyDown={this.handleKeyDown}
              ref={this.initInputRef}
            ></input>
          </div>
          <div>
            <button className='submitButton' onClick={() => { this.addEntry(); this.nameInputRef.current.focus(); }}>
              →
            </button>
          </div>
        </div>
        <DragDropContext onDragEnd={this.onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div className="entries"
                ref={provided.innerRef}
                {...provided.droppableProps}>
                {initiativeOrder
                  .filter(x => {
                    return true;
                  })
                  .map((item, index) => {
                    return (
                      <InitiativeEntry
                        index={index}
                        isActive={index === this.state.activeIndex}
                        displayNum={(index + 1).toString()}
                        id={item.id}
                        key={item.id}
                        name={item.name}
                        initiative={item.initiative}
                        comments={item.comments}
                        onUpdate={this.updateEntry}
                        deleteCallback={this.killChild}
                        triggerSortCallback={this.sortEntries}
                      />
                    );
                  })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        {initiativeOrder.length > 0 && (
          <button className="clearButton" onClick={this.clearEntries}>
            Clear
          </button>
        )}
      </div>
    );
  }
}

InitiativeOrder.propTypes = {
  initialEntries: PropTypes.array
};

export default InitiativeOrder;

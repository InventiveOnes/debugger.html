// @flow
const React = require("react");
const Tree = React.createFactory(require("devtools-sham-modules").Tree);
require("./ManagedTree.css");

type ManagedTreeItem = {
  contents: Array<ManagedTreeItem>,
  name: string,
  path: string
};

type NextProps = {
  autoExpandAll: boolean,
  autoExpandDepth: number,
  getChildren: () => any,
  getKey: (ManagedTreeItem, number) => string,
  getParent: (ManagedTreeItem) => any,
  getRoots: () => any,
  highlightItems: Array<ManagedTreeItem>,
  itemHeight: number,
  listItems?: Array<ManagedTreeItem>,
  onFocus: () => any,
  renderItem: () => any
};

type InitialState = {
  expanded: any,
  focusedItem: ?ManagedTreeItem
};

let ManagedTree = React.createClass({
  propTypes: Tree.propTypes,

  displayName: "ManagedTree",

  getInitialState(): InitialState {
    return {
      expanded: new Set(),
      focusedItem: null
    };
  },

  componentWillReceiveProps(nextProps: NextProps) {
    const listItems = nextProps.listItems;
    if (listItems && listItems != this.props.listItems && listItems.length) {
      this.expandListItems(listItems);
    }

    const highlightItems = nextProps.highlightItems;
    if (highlightItems && highlightItems != this.props.highlightItems &&
       highlightItems.length) {
      this.highlightItem(highlightItems);
    }
  },

  setExpanded(item: ManagedTreeItem, isExpanded: boolean) {
    const expanded = this.state.expanded;
    const key = this.props.getKey(item);
    if (isExpanded) {
      expanded.add(key);
    } else {
      expanded.delete(key);
    }
    this.setState({ expanded });

    if (isExpanded && this.props.onExpand) {
      this.props.onExpand(item);
    } else if (!expanded && this.props.onCollapse) {
      this.props.onCollapse(item);
    }
  },

  expandListItems(listItems: Array<ManagedTreeItem>) {
    const expanded = this.state.expanded;
    listItems.forEach(item => expanded.add(this.props.getKey(item)));
    this.focusItem(listItems[0]);
    this.setState({ expanded: expanded });
  },

  highlightItem(highlightItems: Array<ManagedTreeItem>) {
    const expanded = this.state.expanded;

    // This file is visible, so we highlight it.
    if (expanded.has(this.props.getKey(highlightItems[0]))) {
      this.focusItem(highlightItems[0]);
    } else {
      // Look at folders starting from the top-level until finds a
      // closed folder and highlights this folder
      const index = highlightItems.reverse().findIndex(item =>
        !expanded.has(this.props.getKey(item)));
      this.focusItem(highlightItems[index]);
    }
  },

  focusItem(item: ManagedTreeItem) {
    if (!this.props.disabledFocus && this.state.focusedItem !== item) {
      this.setState({ focusedItem: item });

      if (this.props.onFocus) {
        this.props.onFocus(item);
      }
    }
  },

  render() {
    const { expanded, focusedItem } = this.state;

    const props = Object.assign({}, this.props, {
      isExpanded: item => expanded.has(this.props.getKey(item)),
      focused: focusedItem,

      onExpand: item => this.setExpanded(item, true),
      onCollapse: item => this.setExpanded(item, false),
      onFocus: this.focusItem,

      renderItem: (...args) => {
        return this.props.renderItem(...args, {
          setExpanded: this.setExpanded
        });
      }
    });

    return Tree(props);
  }
});

module.exports = ManagedTree;

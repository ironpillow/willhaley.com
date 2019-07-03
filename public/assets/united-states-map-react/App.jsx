// This is a React functional component
function USMap(props) {
    return (
        <svg viewBox="0 0 960 600">
            {props.statesData.map((stateData, index) =>
                <path
                    className="someCSSClass"
                    style={{cursor: "pointer", fill: "orange"}}
                    key={index}
                    stroke="#fff"
                    strokeWidth="6px"
                    d={stateData.shape}
                    onMouseOver={(event) => {
                        event.target.style.fill = 'red'
                    }}
                    onMouseOut={(event) => {
                        event.target.style.fill = 'orange'
                    }}
                >
                </path>
            )}
        </svg>
    )
}

class App extends React.Component {
    state = { statesData: null }

    constructor(props) {
        super(props)
        this.loadData()
    }

    async loadData() {
        const res = await fetch('https://willhaley.com/assets/united-states-map-react/states.json')
        const statesData = await res.json()
        this.setState({ statesData })
    }

    render() {
        if (this.state.statesData === null) {
            return <div>Loading...</div>
        }
        return <USMap statesData={this.state.statesData} />
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('demo')
)

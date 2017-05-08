import './Home.scss';
import React, { PropTypes, Component } from 'react';
import pouchDB from '../../helper/handlePouchDB.js';
import Selections from '../Selections/Selections.js';
import MainView from '../MainView/MainView.js';
import TimeView from '../TimeView/TimeView.js';
import {
    queryCustomers,
    queryProjects
} from '../../helper/customersHelper.js';

export const DEFAULT_STATE = {
    view: 'main',
    error: false,
    customerId: false,
    projectId: false,
    customer: null,
    project: null,
    projects: null
}

class Home extends Component {

    constructor(props) {
        super(props);

        // default state
        this.state = Object.assign({}, DEFAULT_STATE);

        // fallback for customers as it is loades async
        this.state.customers = null;

        pouchDB.init();
        pouchDB.getDataOrNull('storedAppState', this.getStoredState);
    }

    componentWillMount() {
        this.setState(this.state);
    }

    componentDidUpdate() {
        this.storeState();
    }

    getStoredState = response => {
        const doc = response || {};
        const { stateData: { customers = null } = false } = doc;
        if (customers) {
            this.setState(doc.stateData)
        } else {
            pouchDB.findDocs(this.setStateCustomers, queryCustomers());
        }
    }

    setStateCustomers = response => {
        const customers = response.docs || null;
        this.setState({
            customers
        });
    }

    setStateCustomer = response => {
        const customerId = response._id;
        const customer = response;
        this.setState({
            customerId,
            customer
        });
        pouchDB.findDocs(this.setStateProjects, queryProjects(customerId));
    }

    setStateProjects = response => {
        const projects = response.docs || null;
        const project = false;
        this.setState({
            projects,
            project
        });
    }

    setStateProject = response => {
        const projectId = response._id;
        const project = response;
        const view = 'time';
        this.setState({
            projectId,
            project,
            view
        });
    }

    storeState = () => {
        const currentState = {
            _id: 'storedAppState',
            stateData: this.state
        }
        pouchDB.replaceDoc(currentState);
    }

    changeView = view => {
        this.setState({view})
    }

    backToMainView = () => {
        this.setState(DEFAULT_STATE);
    }

    render() {
        return (
            <div className='homeWrapper'>
                <h1>TimeTracker</h1>

                <Selections
                    customerName={this.state.customer ? this.state.customer.name : ''}
                    projectName={this.state.project ? this.state.project.name : ''} />

                <div className='backToMainView'>
                    <p onClick={this.backToMainView}>Zurück zur Übersicht</p>
                </div>

                {this.state.view === 'main' &&
                    <MainView
                        changeView={this.changeView}
                        customers={this.state.customers}
                        customerId={this.state.customerId}
                        projectId={this.state.projectId}
                        customer={this.state.customer}
                        projects={this.state.projects}
                        project={this.state.project}
                        setStateCustomers={this.setStateCustomers}
                        setStateProjects={this.setStateProjects}
                        setStateCustomer={this.setStateCustomer}
                        setStateProject={this.setStateProject} />
                }

                {this.state.view === 'time' &&
                    <TimeView changeView={this.changeView}
                        customers={this.state.customers}
                        customerId={this.state.customerId}
                        projectId={this.state.projectId}
                        customer={this.state.customer}
                        project={this.state.project} />
                }
            </div>
        );
    }
};

export default Home;

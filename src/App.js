import React, { Component } from 'react';
import Todo from './components/todo/todo';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { routes: [] };
    this.updateState = this.updateState.bind(this);
    this.initMap = this.initMap.bind(this);
    this.createRoute = this.createRoute.bind(this);
    this.createPlacemark = this.createPlacemark.bind(this);
  }
  componentDidMount() {
    this.ymap = window.ymaps;
    this.ymap.ready(this.initMap);
  }
  initMap() {
    this.map = new this.ymap.Map('map', {
      center: [55.76, 37.64],
      zoom: 7,
      controls: []
    });
  }
  updateState(action, value) {
    switch (action) {
      case 'addRoute': {
        this.setState(
          prevState => {
            return { routes: [...prevState.routes, value] };
          },
          () => {
            if (this.state.routes.length > 1) {
              this.createRoute(this.state.routes);
            } else {
              this.createPlacemark(this.state.routes[0]);
            }
          }
        );
        break;
      }
      case 'deleteLastRoute': {
        this.setState(prevState => {
          return { routes: prevState.routes.slice(0, -1) };
        });
        break;
      }
      case 'deleteRoute': {
        this.setState(
          prevState => {
            return { routes: prevState.routes.filter((_, i) => i !== value) };
          },
          () => {
            this.map.geoObjects.removeAll();
            if (this.state.routes.length > 1) {
              this.createRoute(this.state.routes);
            } else if (this.state.routes.length === 1) {
              this.createPlacemark(this.state.routes[0]);
            }
          }
        );
        break;
      }
      case 'changePosition': {
        this.setState(
          prevState => {
            var temp = prevState.routes[value[0]];
            prevState.routes[value[0]] = prevState.routes[value[1]];
            prevState.routes[value[1]] = temp;
            return { routes: prevState.routes };
          },
          () => {
            this.map.geoObjects.removeAll();
            this.createRoute(this.state.routes);
          }
        );
        break;
      }
      default: {
        return null;
      }
    }
  }
  createPlacemark(route) {
    var geocoder = this.ymap.geocode(route);
    geocoder.then(
      res => {
        if (!res.geoObjects.get(0)) {
          alert('error');
          this.updateState('deleteLastRoute');
        } else {
          var coord = res.geoObjects.get(0).geometry.getCoordinates();
          var balloonContent =
            res.geoObjects.get(0).properties.get('description') +
            ', ' +
            res.geoObjects.get(0).properties.get('name');
          var placemark = new this.ymap.Placemark(
            coord,
            {
              iconContent: '1',
              balloonContent
            },
            {
              draggable: true
            }
          );
          this.map.geoObjects.add(placemark);
          this.map.setCenter(coord, 7);
        }
      },
      err => {
        alert('Ошибка');
      }
    );
  }
  createRoute(routes) {
    this.ymap.route(routes).then(
      route => {
        console.log(route.getPaths());
        this.map.geoObjects.add(route);
        var geocoder = this.ymap.geocode(routes[routes.length - 1]);
        geocoder.then(res => {
          this.map.setCenter(
            res.geoObjects.get(0).geometry.getCoordinates(),
            7
          );
        });
      },

      error => {
        alert('Возникла ошибка: ' + error.message);
        this.updateState('deleteLastRoute');
      }
    );
  }
  render() {
    return (
      <div className="App">
        <Todo updateState={this.updateState} routes={this.state.routes} />
        <div id="map" />
      </div>
    );
  }
}

export default App;

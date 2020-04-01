import React, { FunctionComponent } from "react"
import {
	BrowserRouter as Router,
	Switch,
	Route
} from "react-router-dom"
import "pb2-css/dist/less/style.css"
import "./App.css"

const _browserMain = chrome || browser

interface AProps {
	className: string
	href: string
}

const A: FunctionComponent<AProps> = ({children, className, href}) => {
	const click = (event: React.MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault()
		_browserMain.tabs.create({url: href})
		window.close()
	}

	return (
		<a className={className} href={href} target="_blank" rel="noopener noreferrer" onClick={click}>
			{children}
		</a>
	)
}

const Home: FunctionComponent = () => {
	return (
		<div className="flex">
			<header className="w-full">
				<ul>
					<li className="text-align-center">
						<A className="block w-full py-3 hover:bg-grey-5" href="https://phantombuster.com">
							Open Phantombuster
						</A>
					</li>
				</ul>
			</header>
		</div>
	)
}

const App: FunctionComponent = () => {
	return (
		<Router>
			<Switch>
				<Route path="/" component={Home}/>
				<Route path="/popup.html" component={Home} />
				<Route path="/window.html" component={Home} />
			</Switch>
		</Router>
	)
}

export default App

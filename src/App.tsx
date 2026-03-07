import { Route, Switch } from "wouter";
import { UserHome } from "./App/Home";
import { Leaderboard } from "./App/Leaderboard";
import { MyPredictions } from "./App/MyPredictions";
import { Profile } from "./App/Profile";
import { Race } from "./App/Race";
import { RacePrediction } from "./App/RacePrediction";
import { RaceWeekend } from "./App/RaceWeekend";
import { Rules } from "./App/Rules";
import { Season } from "./App/Season";
import { MidSeason } from "./App/Season/MidSeason";
import { MyTeam } from "./App/Season/MyTeam";
import { Wcc } from "./App/Season/Wcc";
import { Wdc } from "./App/Season/Wdc";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ThemeProvider } from "./components/theme-provider";
import { UserProvider } from "./context/UserContext";
import { CreateAccount, Login } from "./Login";

const App = () => (
	<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
		<UserProvider>
			<Switch>
				<Route path="/" component={CreateAccount} />
				<Route path="/login" component={Login} />
				{/* Logged in routes*/}
				<ProtectedRoute>
					<Route path="/home">
						<UserHome />
					</Route>
					<Route path="/u/:username">
						<UserHome />
					</Route>
					<Route path="/race">
						<RaceWeekend />
					</Route>
					<Route path="race/:code/prediction">
						<RacePrediction />
					</Route>
					<Route path="/race/:code">
						<Race />
					</Route>
					<Route path="/season">
						<Season />
					</Route>
					<Route path="/season/wdc">
						<Wdc />
					</Route>
					<Route path="/season/wcc">
						<Wcc />
					</Route>
					<Route path="/season/mid-season">
						<MidSeason />
					</Route>
					<Route path="/season/my-team">
						<MyTeam />
					</Route>
					<Route path="/rules">
						<Rules />
					</Route>
					<Route path="/leaderboard">
						<Leaderboard />
					</Route>
					<Route path="/my-predictions">
						<MyPredictions />
					</Route>
					<Route path="/profile">
						<Profile />
					</Route>
				</ProtectedRoute>
				{/* End logged in routes */}

				<Route>404: No such page!</Route>
			</Switch>
		</UserProvider>
	</ThemeProvider>
);

export default App;

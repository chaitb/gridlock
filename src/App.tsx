import { Route, Switch } from "wouter";
import { Admin } from "./App/Admin";
import { RaceWeekend } from "./App/Calendar";
import { DriverResults } from "./App/DriverResults";
import { DriversStandings } from "./App/DriversStandings";
import { UserHome } from "./App/Home";
import { Leaderboard } from "./App/Leaderboard";
import { LeaguePredictions } from "./App/LeaguePredictions";
import { UserPredictions } from "./App/MyPredictions";
import { Profile } from "./App/Profile";
import { RaceComponent } from "./App/Race";
import { RacePrediction } from "./App/RacePrediction";
import { Rules } from "./App/Rules";
import { Season } from "./App/Season";
import { MidSeason } from "./App/Season/MidSeason";
import { MyTeam } from "./App/Season/MyTeam";
import { Wcc } from "./App/Season/Wcc";
import { Wdc } from "./App/Season/Wdc";
import { Verify } from "./App/Verify";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/sonner";
import { UserProvider } from "./context/UserContext";
import { CreateAccount, Login } from "./Login";

const App = () => (
	<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
		<UserProvider>
			<Switch>
				<Route path="/signup" component={CreateAccount} />
				<Route path="/login" component={Login} />
				<Route path="/verify" component={Verify} />
				{/* Logged in routes*/}
				<ProtectedRoute>
					<Route path="/">
						<UserHome />
					</Route>
					<Route path="/home">
						<UserHome />
					</Route>
					<Route path="/u/:username">
						<UserHome />
					</Route>
					<Route path="/race">
						<RaceWeekend />
					</Route>
					<Route path="race/:circuit_code/prediction">
						<RacePrediction />
					</Route>
					<Route path="race/:circuit_code/league">
						<LeaguePredictions />
					</Route>
					<Route path="/race/:circuit_code">
						<RaceComponent />
					</Route>
					<Route path="/season">
						<Season />
					</Route>
					<Route path="/season/2026">
						<DriversStandings />
					</Route>
					<Route path="/season/2026/:driver">
						<DriverResults />
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
					<Route path="/:username/predictions">
						<UserPredictions />
					</Route>
					<Route path="/profile">
						<Profile />
					</Route>
					<Route path="/__admin">
						<Admin />
					</Route>
				</ProtectedRoute>
				{/* End logged in routes */}

				<Route>404: No such page!</Route>
			</Switch>
			<Toaster />
		</UserProvider>
	</ThemeProvider>
);

export default App;

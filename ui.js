const open = require("open");
const React = require("react");
const PubNub = require("pubnub");
const prompt = require("prompt");
const { Text, Box } = require("ink");
const { usePubNub, PubNubProvider } = require("pubnub-react");
const TextInput = require("ink-text-input").default;

const App = ({ gui = false }) => {
	const [username, setUsername] = React.useState("");
	const [channelName, setChannelName] = React.useState("");

	if (gui) {
		const GUI = async () => {
			await open("https://pubchat-gui.vercel.app/", { wait: true });
		};

		GUI();
	}

	const schema = {
		properties: {
			username: {
				pattern: /^[a-zA-Z\s\-]+$/,
				message: "Name must be only letters, spaces, or dashes",
				required: true,
			},
			channelName: {
				pattern: /^[a-zA-Z\s\-]+$/,
				message: "Name must be only letters, spaces, or dashes",
				required: true,
			},
		},
	};

	React.useEffect(() => {
		if (!gui) {
			prompt.start();
			prompt.message = "";

			prompt.get(schema, (err, result) => {
				setUsername(result.username);
				setChannelName(result.channelName);

				if (err) console.log("An unexpected error occurred:" + err);
			});
		}
	}, []);

	const pubnub = new PubNub({
		publishKey: "pub-c-6fcaa4df-1c5f-4011-907b-0ea9b01d8944",
		subscribeKey: "sub-c-a25a3e76-8167-11eb-bc15-528182b1196d",
		uuid: username,
	});

	return (
		<PubNubProvider client={pubnub}>
			{username && channelName ? (
				<Chat channelName={channelName} username={username} />
			) : null}
		</PubNubProvider>
	);
};

const Chat = (props) => {
	const pubnub = usePubNub();
	//declaring state variables using the state hook
	const [channels, setChannel] = React.useState([props.channelName]);
	const [messages, addMessage] = React.useState([]);
	const [message, setMessage] = React.useState("");

	//adding event handler - function expression
	const handleMessage = (event) => {
		const message = event.message;
		if (typeof message === "string" || message.hasOwnProperty("text")) {
			const text = message.text || message;
			addMessage((messages) => [...messages, text]);
		}
	};

	const formattedMessage = `${pubnub.getUUID()}: ${message}`;

	//publishing a message - function expression
	const sendMessage = (message) => {
		if (message) {
			pubnub
				.publish({ channel: channels[0], message: formattedMessage })
				.then(() => setMessage(""))
				.catch((err) => {
					pubnub.setUUID(props.username);
					console.log("error: ", err);
				});
		}
	};
	//message listener (subscribing to a channel)
	React.useEffect(() => {
		pubnub.addListener({ message: handleMessage });
		pubnub.subscribe({ channels });
	}, [pubnub, channels]);

	return (
		<Box flexDirection="column">
			{/* <Text>Chat App</Text> */}
			<Box flexDirection="column">
				{messages.map((message, index) => {
					return (
						<Box key={`message-${index}`}>
							<Text>{message}</Text>
						</Box>
					);
				})}
			</Box>
			<Box>
				<TextInput
					placeholder="Type your message"
					value={message}
					onSubmit={() => {
						sendMessage(message);
					}}
					onChange={setMessage}
				/>
			</Box>
		</Box>
	);
};

module.exports = App;

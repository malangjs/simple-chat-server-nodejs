"use strict";
const { Grid, Input, Row, Col, Image} = ReactBootstrap;
const socket = io();
socket.on('connect', () => {
	console.log('CONNECTED')
})

const styles = {
	threadWrapper: {
		height: `80%`,
	},
	composerWrapper: {
		height: `20%`,
	},
	messageBuble: {
		border: `1px solid rgba(0,0,0,0.1)`,
		padding: `5px 10px`,
		display: `inline-block`,
		borderRadius: `9999px 9999px 9999px`,
		marginLeft: 5
	},
	messageAvatar: {
		width: 32,
		height: 32,
		borderRadius: `9999px 9999px 9999px`,
		float: `left`,
		display: `inline`
	},
	avatarMe: {
		float: `right`,
	},
	message: {
		width: `70%`,
		float: `left`,
		padding: 10,
	},
	messageMe: {
		textAlign: `right`,
		float: `right`,
	},
	messageBubbleMe: {
		border: `1px solid #2ecc71`,
		backgroundColor: `#2ecc71`,
		color: `#fff`,
		marginRight: 5
	}
}

const Styles = (arr) => {
	return arr.reduce((prev, curr, i) => ({...prev, ...curr}));
}

const MessageBuble = (props) => {
	let bubbleStyle  = [styles.messageBuble];
	let messageFloat = [styles.message];
	let avatarImage  = [styles.messageAvatar];
	if(props.isMe) {
		bubbleStyle.push(styles.messageBubbleMe);
		messageFloat.push(styles.messageMe);
		avatarImage.push(styles.avatarMe);
	}
	return (
		<Col xs={12}>
			<div style={Styles(messageFloat)}>
				<p style={Styles(bubbleStyle)}>{props.text}</p>
				<Image responsive inline src={props.avatar} style={Styles(avatarImage)} />
			</div>
		</Col>
	)
}

class ConversationComposer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			text: ""
		}
	}

	handleChange(text) {
		this.state.text = text;
		this.setState(this.state);
	}

	render() {
		return (
			<Row>
				<Col xs={12}>
					<Input type="textarea" 
						value={this.state.text}
						onChange={(e) => this.handleChange(e.target.value)}
						onKeyDown={(e) => {
							if(e.keyCode == 13) {
								if(this.state.text.trim() !== ""){
									this.props.sendMessage(this.state.text.trim());
									this.setState({text: ""});
								}
							}
						}} />
				</Col>
			</Row>
		)
	}
}


class ConversationThread extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const messages = this.props.messageIds.map((messageId) => this.props.messagesMap[messageId])
			.map((message) => {
				if(message.senderName === this.props.name) message.isMe = true;
				return message;
			})
			.sort((a, b) => new Date(a.messageDate) - new Date(b.messageDate));

		console.log(messages)
		return (
			<Row>
				{
					messages.length?
						messages.map((message) => <MessageBuble key={message.messageId} {...message} />)
					:
					(
						<p style={{textAlign: 'center'}}>No messages yet</p>
					)
				}
			</Row>
		)
	}
}

class ConversationView extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {

		return (
			<Row>
				<Col xs={12} style={styles.threadWrapper}>
					<ConversationThread 
						name={this.props.profile.name}
						messagesMap={this.props.messagesMap}
						messageIds={this.props.messageIds} />
				</Col>
				<Col xs={12} style={styles.composerWrapper}>
					<ConversationComposer sendMessage={this.props.sendMessage} />
				</Col>
			</Row>
		)
	}
}


class Main extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			profile: {},
			messageIds: [],
			messagesMap: {}
		}
	}

	componentDidMount() {
		socket.on('message', (message) => {
			console.log('[MESSAGE]', message)
			this.state.messageIds.push(message.messageId)
			this.state.messagesMap[message.messageId] = message;
			this.setState(this.state)
		})

		socket.on('connected', (initialClient) => {
			console.log('[INITIALCONNECT]', initialClient)
			this.state.profile = initialClient;
			this.setState(this.state);
		})
	}

	sendMessage(text) {
		socket.emit('message', {senderName: this.state.profile.name, avatar: this.state.profile.avatar, text});
	}

	render() {
		return (
			<Grid>
				<ConversationView {...this.state} 
					sendMessage={(text) => {
						this.sendMessage(text);
					}} />
			</Grid>
		)
	}
}


ReactDOM.render(<Main />, document.getElementById('root'))

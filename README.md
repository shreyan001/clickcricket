# ClickCricket

ClickCricket is a decentralized hand-cricket game built on Arweave using Next.js, LangGraph, and AO (Arweave Operations). The game combines traditional hand cricket rules with blockchain technology and AI-powered gameplay.

## Key Features

- **Decentralized Gaming**: Built on Arweave blockchain for transparent and persistent gameplay
- **AI-Powered Opponent**: Uses Groq/Phi model through Gaianet for intelligent game decisions
- **Dual Wallet Support**: Integrates both Arweave and Ethereum wallets
- **Real-time Scoring**: Live updates of score, wickets, and balls
- **State Management**: Persistent game state using AO processes

## Technology Stack

- **Frontend**: Next.js with TypeScript
- **Blockchain**: 
  - Arweave (primary chain)
  - Ethereum (secondary support)
- **AI Integration**:
  - Phi model via Gaianet
  - LangGraph for game flow

```

## Game Rules

- Click to bat and score runs (1-6)
- Avoid matching the AI's number to prevent getting out
- Game ends after 10 wickets
- Score as many runs as possible before getting out

## Architecture

### Frontend Components
- `ClickCricket.tsx`: Main game interface
- `ConnectButton`: Wallet connection component
- Scoreboard and game controls

### Backend Integration
- AO Process handlers for game state
- LangGraph for game flow management
- AI integration for opponent moves

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more information.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Arweave ecosystem
- Gaianet for AI model access
- LangChain community
- AO framework developers

## Contact

For questions and support, please open an issue in the GitHub repository or contact the maintainers.

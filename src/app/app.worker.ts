addEventListener('message', ({ data }) => {
	const response = `LinkiCubaTeam: ${data}`;
	postMessage(response);
});
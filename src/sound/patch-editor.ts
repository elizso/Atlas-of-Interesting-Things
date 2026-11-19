import { NodeEditor, ClassicPreset } from 'rete';
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin';
import {
  ConnectionPlugin,
  BidirectFlow
} from 'rete-connection-plugin';
import {
  LitPlugin,
  Presets as LitPresets,
  type LitArea2D
} from '@retejs/lit-plugin';

// Define the types of nodes and connections
// that our editor understands.
type Schemes = {
  Node: ClassicPreset.Node;
  Connection: ClassicPreset.Connection<
    ClassicPreset.Node,
    ClassicPreset.Node
  >;
};

type AreaExtra = LitArea2D<Schemes>;

export async function createPatchEditor(
  container: HTMLElement
) {
  const editor = new NodeEditor<Schemes>();

  const area = new AreaPlugin<Schemes, AreaExtra>(
    container
  );


	area.addPipe(context => {
		if (context.type === 'render' &&
				context.data.type === 'connection') {
			console.log(
				'🎨 RENDER CONNECTION:',
				context.data
			);
		}

		if (context.type === 'unmount') {
			console.log(
				'🧹 UNMOUNT:',
				context.data
			);
		}

		return context;
	});


  const connection =
    new ConnectionPlugin<Schemes, AreaExtra>();

  const render = new LitPlugin<Schemes, AreaExtra>();

  // Enable built-in node and connection rendering.
  render.addPreset(LitPresets.classic.setup());

  // Enable dragging connections between sockets.
  connection.addPreset(() =>
		new BidirectFlow({
			pickByClick: false
		})
	);

	connection.addPipe(context => {
  if (context.type === 'connectionpick') {
    console.log('🔌 Cable picked');
  }

  if (context.type === 'connectiondrop') {
    console.log('🔌 Cable dropped', context.data);
  }

  return context;
});

  editor.use(area);
  area.use(connection);
  area.use(render);

  // Our first little musical node!
  const socket = new ClassicPreset.Socket('Pattern');

  const notes = new ClassicPreset.Node('♪ Note Pattern');

  notes.addControl(
    'notes',
    new ClassicPreset.InputControl('text', {
      initial: 'c3 e3 g3'
    })
  );

  notes.addOutput(
    'pattern',
    new ClassicPreset.Output(socket, 'Pattern')
  );

  await editor.addNode(notes);

	const reverse = new ClassicPreset.Node("Reverse");

	// The Reverse node receives a musical pattern.
	reverse.addInput(
		'pattern',
		new ClassicPreset.Input(socket, 'Pattern')
	);

	// It produces another musical pattern.
	reverse.addOutput(
		'pattern',
		new ClassicPreset.Output(socket, 'Pattern')
	);

	await editor.addNode(reverse);

	const nodes = editor.getNodes();
	const connections = editor.getConnections();

	console.log(nodes);
	console.log(connections);

  // Place the node inside the canvas.
  await area.translate(notes.id, {
    x: 100,
    y: 100
  });

	await area.translate(reverse.id, {
		x: 450,
		y: 100
	});

  AreaExtensions.zoomAt(area, editor.getNodes());

  return { editor, area, connection, render };
}

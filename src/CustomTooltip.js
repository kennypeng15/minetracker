import { DefaultTooltipContent } from 'recharts';

const CustomTooltip = props => {
  // we don't need to check payload[0] as there's a better prop for this purpose
  if (!props.active || props.payload.length === 0) {
    // I think returning null works based on this: http://recharts.org/en-US/examples/CustomContentOfTooltip
    return null;
  }

  // figure something out to skip
  // can possibly do a more complex check, but this works for now
  if (!("board-3bv" in props.payload[0].payload)) {
    return null;
  }

  // mutating props directly is against react's conventions
  // so we create a new payload with the name and value fields set to what we want
  let newPayload = [
    // ...props.payload,
    // TODO completely ignore the default payload, and just make your own (conditional based on solved or not)
    // some things should be included on EVERY tooltip:
    {
      name: "Board 3BV",
      value: props.payload[0].payload["board-3bv"]
    },
    {
      name: "3BV per Second",
      value: props.payload[0].payload["game-3bvps"]
    },
    {
      name: "Efficiency",
      // all your data which created the tooltip is located in the .payload property
      value: props.payload[0].payload["efficiency"] + "%",
      // you can also add "unit" here if you need it
    },
    {
      name: "Clicks",
      value: props.payload[0].payload["total-clicks"] + " (" + props.payload[0].payload["useful-clicks"] + ", " + props.payload[0].payload["wasted-clicks"] + ")"
    },
    {
      name: "Game Link",
      value: "https://minesweeper.online/game/" + props.payload[0].payload["game-id"]
    },
    {
      name: "Played At",
      value: props.payload[0].payload["game-timestamp"]
    }
  ];

  // depending on if the payload represents a solved game or not, we display different things in the tooltip:
  props.payload[0].payload["board-solved"]
    ? newPayload.unshift({
      name: "Time",
      value: props.payload[0].payload["elapsed-time"],
      unit: "s"
    })
    : newPayload.unshift({
      name: "Estimated Time",
      value: props.payload[0].payload["estimated-time"],
      unit: "s"
    },
      {
        name: "Elapsed Time",
        value: props.payload[0].payload["elapsed-time"],
        unit: "s"
      },
      {
        name: "Completion",
        value: props.payload[0].payload["solve-percentage"].toFixed(3),
        unit: "%"
      },
      {
        name: "Completed Board 3BV",
        value: props.payload[0].payload["completed-3bv"]
      });

  // we render the default, but with our overridden payload
  return <DefaultTooltipContent {...props} payload={newPayload} />;
};

export default CustomTooltip;
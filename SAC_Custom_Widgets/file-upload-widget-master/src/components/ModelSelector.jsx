import React from "react";
import DataImportServiceApi from "../api/dataImportService";
import Error from "./Error";
import {
  ComboBox,
  ComboBoxItem,
  Label,
  Loader,
  Panel,
} from "@ui5/webcomponents-react";
import "@ui5/webcomponents/dist/features/InputSuggestions.js";

function ModelInfo(props) {
  const model = props.models.find((mod) => mod.modelID === props.modelId);
  if (props.networkLoading) {
    return (
      <>
        <Label wrappingType={"Normal"}>Loading models...</Label>
        <Loader />
      </>
    );
  }
  if (props.modelId === "") {
    return (
      <Label wrappingType={"Normal"}>
        Please select a model from the drop down.
      </Label>
    );
  }
  if (model) {
    return (
      <Label wrappingType={"Normal"}>
        {model.modelName} ({model.modelID})
      </Label>
    );
  } else {
    return (
      <Label wrappingType={"Normal"}>
        Selected {props.modelId} (Warning: could not find model in API)
      </Label>
    );
  }
}

function ModelSelector(props) {
  const [models, setModels] = React.useState([]);
  const [filter, setFilter] = React.useState("");
  const [error, setError] = React.useState("");
  const [networkLoading, setNetworkLoading] = React.useState(true);
  const [selectedModel, setSelectedModel] = React.useState(models.find((model) => model.modelID === props.modelId))

  React.useEffect(() => {
    DataImportServiceApi.getInstance()
      .getModels()
      .then((resp) => {
        setModels(resp.models);
        props?.modelId && setSelectedModel(resp?.models.find((model) => model?.modelID === props?.modelId))
        setNetworkLoading(false);
      })
      .catch((err) => {
        setError("Error - " + err.message);
        setNetworkLoading(false);
      });
  }, []);
  let filteredModels = models;
  if (filter) {
    filteredModels = models.filter((model) => {
      return (
        model.modelName.toLowerCase().includes(filter.toLowerCase()) ||
        model.modelID.toLowerCase().includes(filter.toLowerCase()) ||
        model.modelDescription.toLowerCase().includes(filter.toLowerCase())
      );
    });
  }

  return (
    <Panel headerText={"Model Selection"}>
      <div
        style={{ display: "flex", flexDirection: "column", paddingLeft: 30 }}
      >
        <Error message={error} close={() => setError("")} />
        <ModelInfo
          networkLoading={networkLoading}
          models={models}
          modelId={selectedModel?.modelID}
        />
        <ComboBox
          style={{ width: '100%', border: '1px solid lightgrey' }}
          onSelectionChange={(e) => {
            setSelectedModel(models.find((model) => model.modelID === e.detail.item.dataset.id))
            props.setModelId(e.detail.item.dataset.id)
          }
          }
          value={selectedModel ? selectedModel.modelName : ""}
          filter="Contains"
        >
          {filteredModels.map((model) => (
            <ComboBoxItem text={model.modelName} data-id={model.modelID} key={model.modelID} />
          ))}
        </ComboBox>
      </div>
    </Panel>
  );
}

export default ModelSelector;

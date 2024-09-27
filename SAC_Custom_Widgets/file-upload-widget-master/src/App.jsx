/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import ModelSelector from "./components/ModelSelector";
import MappingSelector from "./components/MappingSelector";
import { Loader, ThemeProvider } from "@ui5/webcomponents-react";
import DataImportServiceApi from "./api/dataImportService";
import Error from "./components/Error";
import EndUserWrapper from "./components/endUser/EndUserWrapper";
import AdminBuilderHeader from "./components/AdminBuilderHeader";
import DimensionSelector from "./components/DimensionSelector";
import { API_STATE } from "./components/Constants";

function App(props) {
  const IMPORT_TYPE = "masterData"
  const [modelId, setModelId] = React.useState(props.modelId);
  const [mappings, setMappings] = React.useState(props.mappings || {});
  const [dimension, setDimension] = React.useState(props.dimension?.length > 0 ? props.dimension : undefined)
  const [metadata, setMetadata] = React.useState({});
  const [error, setError] = React.useState("");
  const [mappingObj, setMappingObj] = React.useState({})
  const [mappingObjStatus, setMappingObjStatus] = React.useState(API_STATE.complete);

  const modelChangeHandler = (newModelId) => {
    if (newModelId !== modelId) {
      setModelId(newModelId)
      setDimension()
      setMappings({})
    }
  }

  // Handle setting changes

  React.useEffect(() => {
    if (props.isAdminMode && modelId) {
      props.setWidgetAttribute("modelId", modelId);
    }
  }, [modelId]);

  React.useEffect(() => {
    if (props.isAdminMode && mappings) {
      props.setWidgetAttribute("mappings", mappings);
    }
  }, [mappings]);


  React.useEffect(() => {
    if (props.isAdminMode && dimension) {
      const keys = metadata[IMPORT_TYPE]?.keys
      const tempDefaultValue = {}
      keys?.forEach(element => {
        tempDefaultValue[element] = '-'
      });
      props.setWidgetAttribute("defaultValues", tempDefaultValue);
      props.setWidgetAttribute("dimension", dimension);
    }
  }, [dimension, IMPORT_TYPE, metadata]);

  // Get Metadata
  React.useEffect(() => {
    if (!modelId) {
      return;
    }
    DataImportServiceApi.getInstance()
      .getModelMetadata(modelId)
      .then((resp) => {
        setMetadata(resp);
        setError("");
      })
      .catch((err) => {
        setError("Error - " + err.message);
      });
  }, [modelId]);



  React.useEffect(() => {
    if (props.isAdminMode && dimension && metadata[IMPORT_TYPE]) {
      const tempMeta = metadata[IMPORT_TYPE]
      const columns = dimension ? tempMeta?.columns?.filter(item => item?.columnName.includes(dimension) && item?.columnName?.split('_')[0]?.toLowerCase() === dimension?.toLowerCase()) : []
      if (columns?.length > 1) {
        props.setWidgetAttribute("publicDimensionId", null);
        setMappingObj({ ...tempMeta, columns })
      }
      if (columns?.length === 1) {
        DataImportServiceApi?.getInstance()?.getMetaDataFromPublicDimension(dimension , ({id}) => {
          props.setWidgetAttribute("publicDimensionId", id)
        }).then((data) => {
          setMappingObj(data?.publicDimensionData)
          setMappingObjStatus(API_STATE.complete)
        }).catch(err => {
          setMappingObjStatus(API_STATE.err)
          return;
        })
      }
    }

  }, [dimension, metadata[IMPORT_TYPE]])

  const showScreen = React.useMemo(() => {
    switch (props.mode) {
      case "BUILDER": {
        return (
          <div>
            <AdminBuilderHeader />
            <div style={{ padding: "24px", paddingTop: "12px" }}>
              <Error message={error} close={() => setError("")} />
              <ModelSelector modelId={modelId} setModelId={modelChangeHandler} />
              <DimensionSelector importTypeMetadata={metadata[IMPORT_TYPE]} setDimension={setDimension} dimension={dimension} />
              <MappingSelector
                modelId={modelId}
                importTypeMetadata={mappingObj}
                mappings={mappings}
                setMappings={setMappings}
                mappingStatus={mappingObjStatus}
              />
            </div>
          </div>
        );
      }
      case "Styler": {
        console.log("Styler Panel not implemented.")
        break;
      }
      case ("STORY"):
      default: {
        return <EndUserWrapper modelId={props.modelId} metadata={props.metadata} importType={IMPORT_TYPE} mappings={props.mappings} publicDimensionId={props?.publicDimensionId} defaultValues={props.defaultValues} />
      }
    }
  }, [metadata, dimension, mappingObj, mappingObjStatus]);

  return <ThemeProvider>{(!modelId || (modelId && Object.keys(metadata)?.length > 0)) ? showScreen : <Loader />}</ThemeProvider>;
}

export default App;

import React, { useEffect } from "react";
import DataImportServiceApi from "../api/dataImportService";
import Error from "./Error";
import { Label, Option, Panel, Select } from "@ui5/webcomponents-react";

function DimensionSelector(props) {
  const { importTypeMetadata, setDimension, dimension } = props
  const [dimensionList, setDimensionList] = React.useState([]);
  // const [selectedDimension, setSelectedDimension] = React.useState([]);
  const [error, setError] = React.useState("");

  useEffect(() => {
    if (importTypeMetadata?.keys?.length > 0) {
      const list = importTypeMetadata?.keys?.map(item => item?.split("_")[0])
      setDimensionList(list)
    }
  }, [importTypeMetadata?.keys])
  // if (props.modelId === "") {
  //   return (
  //     <Panel headerText="Import Type" collapsed={true}>
  //       <Label>Please select a model first.</Label>
  //     </Panel>
  //   );
  // }
  return (
    <Panel headerText="Dimension" collapsed={true}>
      <div
        style={{ display: "flex", flexDirection: "column", paddingLeft: 30 }}
      >
        <Error message={error} close={() => setError("")} />
        <Label>Select Dimension</Label>
        <Select
          onChange={(e) =>
            props.setDimension(e.detail.selectedOption.dataset.id)
          }
          style={{ width: '100%', border: '1px solid lightgrey' }}
        >
          <Option key="" data-id="" selected={props.importType === ""}>
            {dimensionList && dimensionList.length === 0 ? "Loading..." : ""}
          </Option>
          {dimensionList.map((name) => {
            console.log(name, dimension)
            return (
              <Option
                key={name}
                data-id={name}
                selected={name === dimension}
              >
                {name}
              </Option>
            );
          })}
        </Select>
        {/* <Label wrappingType="Normal">Note: swapping import type resets default values, mappings, and job settings.</Label> */}
      </div>
    </Panel>
  );
}

export default DimensionSelector;

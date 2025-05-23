import LayerList from "../../components/layerList/LayerList"
import './LayerPanel.css'

const LayerPanel = ()=>{
    return (
        <div className="layer_panel">
            <h3>Layer List</h3>
            <LayerList />
        </div>
    )
}

export default LayerPanel;
import { useDrawing } from "../../DrawingContext";
import type { Layer } from "../../Types";
import './LayerList.css'

const LayerList = ()=>{
    const {layers, setCurrentLayer} = useDrawing();

    const handleLayerClick = (layer: Layer)=>{
        setCurrentLayer(layer);
    }

    return(
        <div className="layer_list">
            <div className="layer_items">
                {layers.map((layer, index) => (
                    <div key={index} className="layer_item" onClick={()=>handleLayerClick(layer)}>
                        <span>레이어 {layers.length - index}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default LayerList;
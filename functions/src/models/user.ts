import { Serializable, JsonProperty } from 'typescript-json-serializer';

@Serializable()
export default class User {
    @JsonProperty() public displayName:string | undefined;
    @JsonProperty() public topScore:Number | undefined;
    @JsonProperty() public deviceId:string | undefined;
    @JsonProperty() public deviceModel:string | undefined;
    @JsonProperty() public isIos:boolean | undefined;
    @JsonProperty() public createDate:string | undefined;
}


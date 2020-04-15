import { ITraceableApiErrorBase } from '@snipsonian/core/es/typings/apiErrors';
import { TNrOfParentNotificationLevelsToTrigger }
    from '@snipsonian/observable-state/es/observer/extendNotificationsToTrigger';

export type TEntityKey = string;

export interface IEntitiesStateBase {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [entityKey: string]: IAsyncEntity<any>;
}

/* Keep in sync with fields in IAsyncEntity and IAsyncEntityKey2ApiConfigMap */
export enum AsyncOperation {
    fetch = 'fetch',
    create = 'create',
    update = 'update',
    remove = 'remove',
}

export interface IAsyncEntity<Data, Error = ITraceableApiErrorBase<{}>> {
    data: Data;
    fetch?: IAsyncEntityOperation<Error>;
    create?: IAsyncEntityOperation<Error>;
    update?: IAsyncEntityOperation<Error>;
    remove?: IAsyncEntityOperation<Error>;
}

export interface IAsyncEntityOperation<Error = ITraceableApiErrorBase<{}>> {
    status: AsyncStatus;
    error: Error;
}

export enum AsyncStatus {
    Initial = 'initial',
    Busy = 'busy',
    Success = 'success',
    Error = 'error',
}

export interface IAsyncEntityKeyConfigs<State, CustomConfig = {}, Error = ITraceableApiErrorBase<{}>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [asyncEntityKey: string]: IAsyncEntityKeyConfig<State, any, {}, {}, {}, {}, Error> & CustomConfig;
}

// eslint-disable-next-line max-len
export interface IAsyncEntityKeyConfig<State, Data, ApiInput, ApiResult, ApiResponse = ApiResult, ExtraInput extends object = {}, Error = ITraceableApiErrorBase<{}>>
    extends IAsyncEntityKeyOperationConfig<State, ApiInput, ApiResult, ApiResponse, ExtraInput>{
    operations: AsyncOperation[];
    initialState: IAsyncEntity<Data, Error>;
}

// eslint-disable-next-line max-len
export interface IAsyncEntityKeyOperationConfig<State, ApiInput, ApiResult, ApiResponse = ApiResult, ExtraInput extends object = {}> {
    fetch?: IAsyncEntityApiConfig<State, ExtraInput, ApiInput, ApiResult, ApiResponse>;
    create?: IAsyncEntityApiConfig<State, ExtraInput, ApiInput, ApiResult, ApiResponse>;
    update?: IAsyncEntityApiConfig<State, ExtraInput, ApiInput, ApiResult, ApiResponse>;
    remove?: IAsyncEntityApiConfig<State, ExtraInput, ApiInput, ApiResult, ApiResponse>;
}

// eslint-disable-next-line max-len
export interface IAsyncEntityApiConfig<State, ExtraInput extends object, ApiInput, ApiResult, ApiResponse = ApiResult> {
    api: (apiInput: ApiInput) => Promise<ApiResponse>;
    /* only to be configured if input needed */
    apiInputSelector?: (props: { state: State; extraInput?: ExtraInput }) => ApiInput;
    /* only to be configured if api response has to be mapped */
    mapApiResponse?: (props: { response: ApiResponse; state: State; extraInput?: ExtraInput }) => ApiResult;
}

export interface IAsyncEntityKey2ApiOperationConfigMap<State> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [asyncEntityKey: string]: IAsyncEntityApiConfig<State, {}, any, any>;
}

/* eslint-disable max-len */
export interface IAsyncEntityManager<State, StateChangeNotificationKey, CustomConfig = {}, Error = ITraceableApiErrorBase<{}>> {
    register<Data, ApiInput, ApiResult, ApiResponse = ApiResult, ExtraInput extends object = {}>(props: {
        asyncEntityKey: TEntityKey;
        operationsConfig: IAsyncEntityKeyOperationConfig<State, ApiInput, ApiResult, ApiResponse, ExtraInput>;
        initialData?: Data;
        customConfig?: CustomConfig;
    }): void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getAsyncEntityConfig<Data = any>(props: { asyncEntityKey: TEntityKey }): IAsyncEntityKeyConfig<State, Data, {}, {}, {}, {}, Error>;
    getAsyncEntityOperationConfig(props: { asyncEntityKey: TEntityKey; operation: AsyncOperation }): IAsyncEntityApiConfig<State, {}, {}, {}>;
    /* triggerAsyncEntityFetch returns a if it was triggered (true) or not (false) */
    triggerAsyncEntityFetch<ExtraInput extends object, ApiResult = {}, ApiResponse = ApiResult>(props: ITriggerAsyncEntityFetchProps<State, ExtraInput, StateChangeNotificationKey>): boolean;
    // TODO triggerAsyncEntity... Create/Update/Remove
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getAsyncEntity<Data = any>(props: { asyncEntityKey: TEntityKey }): IAsyncEntity<Data, Error>;
    getEntitiesInititialState(): IEntitiesInitialState;
}
/* eslint-enable max-len */

export interface ITriggerAsyncEntityFetchProps<State, ExtraInput extends object, StateChangeNotificationKey> {
    asyncEntityToFetch: IAsyncEntityToFetch<State, ExtraInput>;
    extraInput?: ExtraInput;
    /**
     * If notificationsToTrigger not specified, by default a notification will be triggered (possibly extended with
     * parent notifications based on the nrOfParentNotificationLevelsToTrigger) of the following format:
     *   "entities.<asyncEntityKey>.<operation>"
     *   e.g. "entities.notifications.fetch"
     */
    notificationsToTrigger?: StateChangeNotificationKey[];
    nrOfParentNotificationLevelsToTrigger?: TNrOfParentNotificationLevelsToTrigger;
}

export interface IAsyncEntityToFetch<State, ExtraInput extends object> {
    asyncEntityKey: TEntityKey;
    shouldFetch?: (props: { state: State; extraInput?: ExtraInput }) => boolean; // default true
    /* refreshMode indicates what should happen if the entity data is already available */
    refreshMode?: TRefreshMode<State, ExtraInput>; // default 'always'
    resetDataOnTrigger?: boolean; // default true
}

export type TRefreshMode<State, ExtraInput> = 'never' | 'always' | TOnlyRefreshIf<State, ExtraInput>;

export type TOnlyRefreshIf<State, ExtraInput> = (props: { state: State; extraInput?: ExtraInput }) => boolean;

export interface IEntitiesInitialState {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: IAsyncEntity<any>;
}

export interface IWithKeyIndex {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

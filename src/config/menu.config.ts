import ROUTES from 'views/routes';
import ROUTE_KEYS from '../routeKeys';

export interface IMenuItem {
    id: string;
    label: string;
    path: string;
}

export const MAIN_NAV_ITEMS: IMenuItem[] = [
    toMenuItem({
        id: 'home',
        label: 'Home',
        routeKey: ROUTE_KEYS.R_HOME,
    }),
    toMenuItem({
        id: 'design',
        label: 'Design',
        routeKey: ROUTE_KEYS.R_DESIGN,
    }),
    toMenuItem({
        id: 'report',
        label: 'Report',
        routeKey: ROUTE_KEYS.R_REPORT,
    }),
];

interface IMenuItemConfig {
    id: string;
    label: string;
    routeKey: ROUTE_KEYS;
}

function toMenuItem({
    id,
    label,
    routeKey,
}: IMenuItemConfig): IMenuItem {
    return {
        id,
        label,
        path: ROUTES[routeKey].path,
    };
}
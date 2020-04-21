import React, { ReactNode } from 'react';
import { NavLink as RouterNavLink, NavLinkProps } from 'react-router-dom';
import isSet from '@snipsonian/core/es/is/isSet';
import { makeStyles, Theme } from '@material-ui/core';
import { IPathParams } from 'models/router.models';
import { getRoute, ROUTE_KEYS } from 'views/routes';
import replacePathPlaceholders from 'utils/navigation/replacePathPlaceholders';

interface IPublicProps extends Pick<NavLinkProps, 'exact'> {
    to: ROUTE_KEYS;
    params?: IPathParams;
    flashMessageLink?: boolean;
    children: ReactNode;
}

const ACTIVE_CLASS_NAME = 'active';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        color: theme.palette.text.primary,
        '&.active': {
            color: theme.palette.primary.main,
        },
    },
    flashMessageLink: {
        color: 'inherit',
    },
}));

function RouteLink(props: IPublicProps) {
    const { to: routeKey, params, exact, flashMessageLink, children } = props;
    const classes = useStyles();

    const route = getRoute({ routeKey });

    const shouldMatchExact = isSet(exact)
        ? exact
        : false;

    const urlTo = replacePathPlaceholders({
        path: route.path,
        placeholders: params,
    });

    return (
        <RouterNavLink
            to={urlTo}
            exact={shouldMatchExact}
            activeClassName={ACTIVE_CLASS_NAME}
            className={flashMessageLink ? classes.flashMessageLink : classes.root}
        >
            {children}
        </RouterNavLink>
    );
}

export default RouteLink;
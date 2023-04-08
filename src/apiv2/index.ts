import { Router, static as Static} from 'express';
import * as express from 'express';
import * as bodyParser from 'body-parser';

import songs from './songs';
import compare from './compare';
import info from './info';
import streaming from './streaming'
import price from './price'
import table from './table'
import counter from './counter'
import achievements from './achievements'
import iidxsongs from './iidxsongs'
import manhwa from './manhwa'
import member from './member'
import renewal from './renewal'
import etc from './etc'
import maple from './maple'
import boj from './boj'
import popn_songs from './popn_songs'
import drummania from './drummania'

const router = Router();
export default router;

router.use(bodyParser.json());
router.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);


router.use(Static('static'));
router.use('/apiv2/songs', songs);
router.use('/apiv2/compare', compare);
router.use('/apiv2/info', info);
router.use('/apiv2/streaming', streaming);
router.use('/apiv2/price', price);
router.use('/apiv2/table', table);
router.use('/apiv2/counter', counter);
router.use('/apiv2/achievements', achievements);
router.use('/apiv2/iidxsongs', iidxsongs);
router.use('/apiv2/manhwa', manhwa);
router.use('/apiv2/member', member);
router.use('/apiv2/renewal', renewal);
router.use('/apiv2/etc', etc);
router.use('/apiv2/maple', maple);
router.use('/apiv2/boj', boj);
router.use('/apiv2/popn_songs', popn_songs);
router.use('/apiv2/drummania', drummania);
import { CustomRequest } from "../../custom";

/**
 * @apiDefine SortOrder 정렬 지원
 * @apiParam (Query) {String} [orderBy] 정렬 기준
 * @apiParam (Query) {Boolean} [orderAsc=true] 정렬 방법(오름차순/내림차순)
 */
export function getOrder(req: CustomRequest) {
    let orderBy = req.query.orderBy as string;
    let orderAscStr = req.query.orderAsc as string;

    let order: any = null;

    if (orderBy != null) {
        let orderAsc = true;
        if (orderAscStr != null) {
            orderAsc = orderAscStr != 'false';
        }

        order = [
            [orderBy, orderAsc ? 'ASC' : 'DESC'],
        ];
    }

    return order;
}
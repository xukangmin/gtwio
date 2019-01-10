export const ParamList = ({ params }) => {
    return (
    <table class="table">
        <thead>
            <tr>
            <th>Tag</th>
            <th>Related Device/Parameter</th>
            <th>Equation</th>
            <th>Description</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>AVG_COLD_INLET</td>
                <td>02A001, 02A002</td>
                <td><a class="openSettingModal" data-id="aaa" href="#" data-toggle="modal" data-target="#dataModal">AVG(#COLD_INLET#)</a></td>
                <td>Calculate Average Hot Inlet Temperature</td>
            </tr>
            <tr>
                <td>AVG_HOT_INLET</td>
                <td>02A003, 02A004</td>
                <td><a class="openSettingModal" data-id="aaa" href="#" data-toggle="modal" data-target="#dataModal">AVG(#HOT_INLET#)</a></td>
                <td>Calculate Average Hot Inlet Temperature</td>
            </tr>
        </tbody>
    </table>
    );
}
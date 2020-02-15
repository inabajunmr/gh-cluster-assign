/**
 * @name TODO
 * @kind problem
 * @problem.severity warning
 * @id javascript/comment/todo
 */

import javascript

from Comment c
where c.getText().regexpMatch("(?si).*\\bTODO\\b.*")
select c

